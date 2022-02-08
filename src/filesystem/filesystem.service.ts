import { Injectable, OnModuleInit, StreamableFile } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, TreeRepository } from 'typeorm';
import {
  CreateFileDto,
  CreateFolderDto,
  GetNodeDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { Node, NodeType } from './filesystem.entity';
import { UploadsManager } from '../utils/uploadsManager';
import { err, Status } from '../utils/communication';
import { createReadStream } from 'graceful-fs';
import { join } from 'path';
import { existsSync } from 'fs';

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
      newRoot.encryptedKey = '';
      newRoot.encryptedMetadata = '';
      newRoot.type = NodeType.FOLDER;
      newRoot.ref = '';
      newRoot.encryptedParentKey = '';
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
  async getFileSystem(nodeId?: number): Promise<Node> {
    let node: Node;
    if (nodeId) {
      node = await this.findOne({ where: { id: nodeId } });
    } else {
      node = await this.findAll();
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

    // file will be deleted in 30 seconds
    setTimeout(() => {
      UploadsManager.deleteTmpFile(file.filename);
    }, 30000);

    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves an uploaded file from temporary folder to permanent folder.
   */
  async createFile(dto: CreateFileDto) {
    const newFile = new Node();
    newFile.iv = dto.iv;
    newFile.tag = dto.tag;
    newFile.encryptedKey = dto.encryptedKey;
    newFile.encryptedMetadata = dto.encryptedMetadata;
    newFile.type = NodeType.FILE;
    newFile.ref = dto.ref;
    newFile.encryptedParentKey = dto.encryptedParentKey;
    newFile.owner = dto.user;
    newFile.parent = await this.findOne({
      where: {
        id: dto.parentId,
        type: NodeType.FOLDER,
      },
    });
    UploadsManager.moveFileFromTmpToPermanent(dto.ref);
    await this.nodeRepo.save(newFile);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   */
  async createFolder(dto: CreateFolderDto) {
    const newFolder = new Node();
    newFolder.iv = dto.iv;
    newFolder.tag = dto.tag;
    newFolder.encryptedKey = dto.encryptedKey;
    newFolder.encryptedMetadata = dto.encryptedMetadata;
    newFolder.type = NodeType.FOLDER;
    newFolder.ref = '';
    newFolder.encryptedParentKey = dto.encryptedParentKey;
    newFolder.owner = dto.user;
    newFolder.parent = await this.findOne({
      where: {
        id: dto.parentId,
        type: NodeType.FOLDER,
      },
    });
    await this.nodeRepo.save(newFolder);
  }

  /**
   * Updates a file node's reference (same as overwriting the file).
   * Moves an uploaded file from temporary folder to permanent folder.
   */
  async updateRef(dto: UpdateRefDto) {
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        type: NodeType.FILE,
      },
    });

    UploadsManager.moveFileFromTmpToPermanent(dto.newRef); // moving new file to permanent folder
    UploadsManager.deletePermanentFile(node); // deleting old file
    node.ref = dto.newRef; // updating file reference (just like overwrite)

    await this.nodeRepo.save(node);
  }

  /**
   * Updates a node's metadata.
   */
  async updateMetadata(dto: UpdateMetadataDto) {
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
      },
    });
    node.encryptedMetadata = dto.newEncryptedMetadata;
    await this.nodeRepo.save(node);
  }

  /**
   * Updates a node's parent (same as moving the node).
   */
  async updateParent(dto: UpdateParentDto) {
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
      },
    });

    // updating parent
    node.parent = await this.findOne({
      where: {
        id: dto.newParentId,
        type: NodeType.FOLDER,
      },
    });

    await this.nodeRepo.save(node);
  }

  /**
   * Deletes a node by id and all of its descendant.
   */
  async delete(dto: GetNodeDto) {
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
      },
    });
    const descendants = await this.nodeRepo.findDescendants(node);

    // removes the files stored on server disk
    // for the nodes representing a file
    for (const descendant of descendants) {
      UploadsManager.deletePermanentFile(descendant);
    }

    // removes the target node form database with all its descendants
    // because their onDelete option should be set to CASCADE
    await this.nodeRepo.remove(node);
  }

  /**
   * Find the Node entity of the file in the database
   * Return the file content of the file.
   */
  async getFile(nodeId: number): Promise<StreamableFile> {
    const node = await this.findOne({
      where: { id: nodeId, type: NodeType.FILE },
    });
    const path = join(process.cwd(), UploadsManager.uploadFolder, node.ref);
    if (existsSync(path)) {
      const file = createReadStream(path);
      return new StreamableFile(file);
    }
    throw err(Status.ERROR_FILE_NOT_FOUND, 'No file found on disk.');
  }
}
