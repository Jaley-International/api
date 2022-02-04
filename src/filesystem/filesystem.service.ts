import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, TreeRepository } from 'typeorm';
import {
  CreateFileDto,
  CreateFolderDto,
  CreateRootDto,
  GetNodeDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { Node, NodeType } from './filesystem.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { UploadFoldersManager } from '../utils/uploadFoldersManager';
import findRemoveSync from 'find-remove';
import { Communication, Status } from '../utils/communication';

@Injectable()
export class FilesystemService implements OnModuleInit {
  constructor(
    @InjectRepository(Node)
    private nodeRepo: TreeRepository<Node>,
    private userService: UserService,
  ) {}

  onModuleInit() {
    // constantly checks for files old enough to be deleted in the tmp folder
    //TODO fires timer event only when file is uploaded
    setInterval(() => {
      findRemoveSync(UploadFoldersManager.tmpFolder, {
        files: '*.*',
        age: { seconds: 60 },
      });
    });
  }

  //TODO get the current connected user for security verification

  /**
   * Basic findOne function on Node repository,
   * but throws an error when no node is found.
   */
  async findOne(options: FindOneOptions<Node>): Promise<Node> {
    const node = await this.nodeRepo.findOne(options);
    if (node === undefined) {
      throw Communication.err(Status.ERROR_NODE_NOT_FOUND, 'Node not found.');
    }
    return node;
  }

  /**
   * Returns all the file system trees of all users.
   * May be deleted for production.
   */
  async findAll(): Promise<Node[]> {
    return await this.nodeRepo.findTrees();
  }

  /**
   * Returns the file system tree owned by the user passed in parameter.
   * Throws an exception if no roots are found.
   */
  async getFileSystemFromUser(user: User): Promise<Node[]> {
    // getting all user's roots
    const roots = await this.nodeRepo.find({
      where: { parent: null, type: NodeType.FOLDER, treeOwner: user },
    });

    // generating all the trees from user's roots
    const trees = [];
    for (const root of roots) {
      trees.push(await this.nodeRepo.findDescendantsTree(root));
    }
    return trees;
  }

  /**
   * Returns the file system tree owned by the user passed in parameter.
   */
  async getFileSystemFromUserId(userId: number): Promise<Node[]> {
    const user = await this.userService.findOne({ where: { id: userId } });
    return await this.getFileSystemFromUser(user);
  }

  /**
   * Adds a new root to the file system of the specified user
   * Returns the updated user's trees.
   */
  async createRoot(dto: CreateRootDto): Promise<Node[]> {
    // creating new folder node
    const newRoot = new Node();
    newRoot.encryptedKey = dto.encryptedKey;
    newRoot.encryptedMetadata = dto.encryptedMetadata;
    newRoot.type = NodeType.FOLDER;
    newRoot.ref = '';
    newRoot.encryptedParentKey = '';
    newRoot.treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });
    newRoot.parent = null;

    // database upload
    await this.nodeRepo.save(newRoot);

    // return the trees owned by the user
    return await this.getFileSystemFromUser(newRoot.treeOwner);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns the updated user's trees.
   */
  async createFolder(dto: CreateFolderDto): Promise<Node[]> {
    // creating new folder node
    const newFolder = new Node();
    newFolder.encryptedKey = dto.encryptedKey;
    newFolder.encryptedMetadata = dto.encryptedMetadata;
    newFolder.type = NodeType.FOLDER;
    newFolder.ref = '';
    newFolder.encryptedParentKey = dto.encryptedParentKey;
    newFolder.treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });

    newFolder.parent = await this.nodeRepo.findOne({
      where: {
        id: dto.parentId,
        type: NodeType.FOLDER,
        treeOwner: newFolder.treeOwner,
      },
    });

    // database upload
    await this.nodeRepo.save(newFolder);

    // returns owner's trees
    return await this.getFileSystemFromUser(newFolder.treeOwner);
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves an uploaded file from temporary folder to permanent folder.
   * Returns the updated user's trees.
   */
  async createFile(dto: CreateFileDto): Promise<Node[]> {
    // creating new file node
    const newFile = new Node();
    newFile.encryptedKey = dto.encryptedKey;
    newFile.encryptedMetadata = dto.encryptedMetadata;
    newFile.type = NodeType.FILE;
    newFile.ref = dto.ref;
    newFile.encryptedParentKey = dto.encryptedParentKey;
    newFile.treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });
    newFile.parent = await this.findOne({
      where: {
        id: dto.parentId,
        treeOwner: newFile.treeOwner,
        type: NodeType.FOLDER,
      },
    });

    // moving file from temporary folder
    UploadFoldersManager.moveFileFromTmpToPermanent(dto.ref);

    // database upload
    await this.nodeRepo.save(newFile);

    // returns owner's trees
    return await this.getFileSystemFromUser(newFile.treeOwner);
  }

  /**
   * Updates a file node's reference (same as overwriting the file).
   * Moves an uploaded file from temporary folder to permanent folder.
   * Returns the updated user's trees.
   */
  async updateRef(dto: UpdateRefDto) {
    const treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        treeOwner: treeOwner,
        type: NodeType.FILE,
      },
    });

    // moving file from temporary folder
    UploadFoldersManager.moveFileFromTmpToPermanent(dto.newRef);

    // deleting old file
    node.deleteStoredFile();

    // updating file reference
    node.ref = dto.newRef;

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(treeOwner);
  }

  /**
   * Updates a node's metadata.
   * Returns the updated user's trees.
   */
  async updateMetadata(dto: UpdateMetadataDto) {
    const treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        treeOwner: treeOwner,
      },
    });

    // updating meta data
    node.encryptedMetadata = dto.newEncryptedMetadata;

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(treeOwner);
  }

  /**
   * Updates a node's parent (same as moving the node).
   * Returns the updated user's trees.
   */
  async updateParent(dto: UpdateParentDto) {
    // finding the node to move
    const treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        treeOwner: treeOwner,
      },
    });

    // updating parent
    node.parent = await this.findOne({
      where: {
        id: dto.newParentId,
        treeOwner: treeOwner,
        type: NodeType.FOLDER,
      },
    });

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(treeOwner);
  }

  /**
   * Deletes a node by id and all of its descendant.
   * Returns the deleted target node.
   */
  async delete(dto: GetNodeDto): Promise<Node[]> {
    // finding the node to delete
    const treeOwner = await this.userService.findOne({
      where: { id: dto.treeOwnerId },
    });
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        treeOwner: treeOwner,
      },
    });
    const descendants = await this.nodeRepo.findDescendants(node);

    // removes the files stored on server disk
    // for the nodes representing a file
    for (const descendant of descendants) {
      descendant.deleteStoredFile();
    }

    // removes the target node form database with all its descendants
    // because their onDelete option should be set to CASCADE
    await this.nodeRepo.remove(node);
    return await this.getFileSystemFromUser(treeOwner);
  }
}
