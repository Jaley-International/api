import { Injectable, OnModuleInit, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, TreeRepository } from 'typeorm';
import {
  CreateFileDto,
  CreateFolderDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { Node, NodeType } from './filesystem.entity';
import {
  deletePermanentFile,
  deleteTmpFile,
  DiskFolders,
  moveFileFromTmpToPermanent,
} from '../utils/uploadsManager';
import { err, Status } from '../utils/communication';
import { createReadStream } from 'graceful-fs';
import { join } from 'path';
import { existsSync } from 'fs';
import { User } from '../user/user.entity';
import { Link } from '../link/link.entity';

@Injectable()
export class FilesystemService implements OnModuleInit {
  constructor(
    @InjectRepository(Node)
    private nodeRepo: TreeRepository<Node>,
  ) {}

  /**
   * Creates a root folder for the filesystem on startup
   * if the current filesystem is empty.
   */
  async onModuleInit() {
    const filesystem = await this.findAll();
    if (!filesystem) {
      // creating new folder node
      // will be used as an absolute root
      const newRoot = new Node();
      newRoot.iv = '';
      newRoot.tag = '';
      newRoot.encryptedNodeKey = '';
      newRoot.encryptedMetadata = '';
      newRoot.type = NodeType.FOLDER;
      newRoot.ref = '';
      newRoot.parentEncryptedKey = '';
      newRoot.owner = null;
      newRoot.parent = null;

      // database upload
      await this.nodeRepo.save(newRoot);
    }
  }

  /**
   * Returns all the file system tree.
   */
  private async findAll(): Promise<Node> {
    const data = await this.nodeRepo.findTrees();
    if (!data) {
      throw err(Status.ERROR_NODE_NOT_FOUND, 'Empty file system.');
    }
    return data[0];
  }

  /**
   * Basic findOne function on Node repository,
   * but throws an exception when no node is found.
   */
  async findOne(options: FindOneOptions<Node>): Promise<Node> {
    const node = await this.nodeRepo.findOne(options);
    if (!node) {
      throw err(Status.ERROR_NODE_NOT_FOUND, 'Node not found.');
    }
    return node;
  }

  /**
   * Returns the descendant tree of the targeted node by id.
   * If no node id is passed in argument, returns the whole filesystem.
   */
  async getFileSystem(curUser: User, nodeId?: number): Promise<Node> {
    let node: Node;
    if (nodeId) {
      node = await this.findOne({ where: { id: nodeId } });
    } else {
      node = await this.findAll();
    }
    if (node.parent && node.owner !== curUser) {
      throw err(
        Status.ERROR_INVALID_NODE_OWNER,
        'Current user is not the owner of the node.',
      );
    }
    return await this.nodeRepo.findDescendantsTree(node);
  }

  /**
   * Throws an error if the file object in argument is invalid (undefined, empty, not uploaded...).
   * This file will be deleted if he's still in the temporary folder after 30 seconds.
   * Returns the name of the file.
   */
  uploadFile(file: Express.Multer.File): string {
    // error on invalid file
    if (!file) {
      throw err(
        Status.ERROR_INVALID_FILE,
        'Non existing or invalid file has been tried to be sent.',
      );
    }

    // file will be deleted after some time
    setTimeout(() => {
      deleteTmpFile(file.filename);
    }, parseInt(process.env.PEC_API_TMP_FILE_EXP) * 1000);

    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves an uploaded file from temporary folder to permanent folder.
   */
  async createFile(curUser: User, body: CreateFileDto) {
    const newFile = new Node();
    newFile.iv = body.iv;
    newFile.tag = body.tag;
    newFile.encryptedNodeKey = body.encryptedNodeKey;
    newFile.encryptedMetadata = body.encryptedMetadata;
    newFile.type = NodeType.FILE;
    newFile.ref = body.ref;
    newFile.parentEncryptedKey = body.parentEncryptedKey;
    newFile.owner = curUser;
    newFile.parent = await this.findOne({
      where: {
        id: body.parentId,
        type: NodeType.FOLDER,
      },
    });
    moveFileFromTmpToPermanent(body.ref);
    await this.nodeRepo.save(newFile);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   */
  async createFolder(curUser: User, body: CreateFolderDto) {
    const newFolder = new Node();
    newFolder.iv = body.iv;
    newFolder.tag = body.tag;
    newFolder.encryptedNodeKey = body.encryptedNodeKey;
    newFolder.encryptedMetadata = body.encryptedMetadata;
    newFolder.type = NodeType.FOLDER;
    newFolder.ref = '';
    newFolder.parentEncryptedKey = body.parentEncryptedKey;
    newFolder.owner = curUser;
    newFolder.parent = await this.findOne({
      where: {
        id: body.parentId,
        type: NodeType.FOLDER,
      },
    });
    await this.nodeRepo.save(newFolder);
  }

  /**
   * Updates a file node's reference (same as overwriting the file).
   * Moves an uploaded file from temporary folder to permanent folder.
   */
  async updateRef(nodeId: number, body: UpdateRefDto) {
    const node = await this.findOne({
      where: {
        id: nodeId,
        type: NodeType.FILE,
      },
    });

    moveFileFromTmpToPermanent(body.newRef); // moving new file to permanent folder
    deletePermanentFile(node); // deleting old file
    node.ref = body.newRef; // updating file reference (just like overwrite)
    node.encryptedMetadata = body.newEncryptedMetadata;
    node.tag = body.newTag;

    await this.nodeRepo.save(node);
  }

  /**
   * Updates a node's metadata.
   */
  async updateMetadata(nodeId: number, body: UpdateMetadataDto) {
    const node = await this.findOne({
      where: {
        id: nodeId,
      },
    });
    node.encryptedMetadata = body.newEncryptedMetadata;
    await this.nodeRepo.save(node);
  }

  /**
   * Updates a node's parent (same as moving the node).
   */
  async updateParent(nodeId: number, body: UpdateParentDto) {
    const node = await this.findOne({
      where: {
        id: nodeId,
      },
    });

    // updating parent
    node.parent = await this.findOne({
      where: {
        id: body.newParentId,
        type: NodeType.FOLDER,
      },
    });

    await this.nodeRepo.save(node);
  }

  /**
   * Deletes a node by id and all of its descendant.
   */
  async delete(nodeId: number) {
    const node = await this.findOne({
      where: {
        id: nodeId,
      },
    });
    const descendants = await this.nodeRepo.findDescendants(node);

    // removes the files stored on server disk
    // for the nodes representing a file
    for (const descendant of descendants) {
      deletePermanentFile(descendant);
    }

    // removes the target node form database with all its descendants
    // because their onDelete option should be set to CASCADE
    await this.nodeRepo.remove(node);
  }

  /**
   * Returns all the links in relation with a targeted node.
   */
  async getLinks(nodeId: number): Promise<Link[]> {
    const node = await this.findOne({
      where: { id: nodeId },
      relations: ['links'],
    });
    return node.links;
  }

  /**
   * Find the Node entity of the file in the database
   * Return the file content of the file.
   */
  async getFile(nodeId: number): Promise<StreamableFile> {
    const node = await this.findOne({
      where: { id: nodeId, type: NodeType.FILE },
    });
    const path = join(process.cwd(), DiskFolders.PERM, node.ref);
    if (existsSync(path)) {
      const file = createReadStream(path);
      return new StreamableFile(file);
    }
    throw err(Status.ERROR_FILE_NOT_FOUND, 'No file found on disk.');
  }
}
