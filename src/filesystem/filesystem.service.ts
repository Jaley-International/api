import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
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
import { Utils } from '../utils';

@Injectable()
export class FilesystemService {
  constructor(
    @InjectRepository(Node)
    private nodeRepo: TreeRepository<Node>,
    private userService: UserService,
  ) {}

  //TODO get the current connected user for security verification

  /**
   * Returns all the file system trees of all users.
   * May be deleted for production.
   */
  async findAll(): Promise<Node[]> {
    return await this.nodeRepo.findTrees();
  }

  /**
   * Returns the node corresponding to the id, type, and owner passed in
   * parameters.
   * Returns a node no matter its type if type is set to null.
   * Throws an exception if no appropriate node is found.
   */
  private async findOne(
    nodeId: number,
    userId: number,
    type: NodeType,
  ): Promise<Node> {
    let node: Node;
    const treeOwner = await this.userService.findOne(userId);

    if (type === null) {
      node = await this.nodeRepo.findOne({
        id: nodeId,
        treeOwner: treeOwner,
      });
    } else {
      node = await this.nodeRepo.findOne({
        id: nodeId,
        type: type,
        treeOwner: treeOwner,
      });
    }

    if (node === undefined) {
      throw new HttpException('node not found', HttpStatus.NOT_FOUND);
    }
    return node;
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
    if (roots.length === 0) {
      throw new HttpException('no roots found', HttpStatus.NOT_FOUND);
    }

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
    const user = await this.userService.findOne(userId);
    return await this.getFileSystemFromUser(user);
  }

  /**
   * Adds a new root to the file system of the specified user
   * Returns the updated user's trees.
   */
  async createRoot(dto: CreateRootDto): Promise<Node[]> {
    // creating new folder node
    const newRootNode = new Node();
    newRootNode.encryptedKey = dto.encryptedKey;
    newRootNode.encryptedMetadata = dto.encryptedMetadata;
    newRootNode.type = NodeType.FOLDER;
    newRootNode.ref = null;
    newRootNode.encryptedParentKey = null;
    newRootNode.treeOwner = await this.userService.findOne(dto.userId);
    newRootNode.parent = null;

    // database upload
    await this.nodeRepo.save(newRootNode);

    // return the trees owned by the user
    return await this.getFileSystemFromUser(newRootNode.treeOwner);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns the updated user's trees.
   */
  async createFolder(dto: CreateFolderDto): Promise<Node[]> {
    // creating new folder node
    const newFolderNode = new Node();
    newFolderNode.encryptedKey = dto.encryptedKey;
    newFolderNode.encryptedMetadata = dto.encryptedMetadata;
    newFolderNode.type = NodeType.FOLDER;
    newFolderNode.ref = null;
    newFolderNode.encryptedParentKey = dto.encryptedParentKey;
    newFolderNode.treeOwner = await this.userService.findOne(dto.userId);
    newFolderNode.parent = await this.findOne(
      dto.parentId,
      dto.userId,
      NodeType.FOLDER,
    );

    // database upload
    await this.nodeRepo.save(newFolderNode);

    // returns owner's trees
    return await this.getFileSystemFromUser(newFolderNode.treeOwner);
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves an uploaded file from temporary folder to permanent folder.
   * Returns the updated user's trees.
   */
  async createFile(dto: CreateFileDto): Promise<Node[]> {
    // creating new file node
    const newFileNode = new Node();
    newFileNode.encryptedKey = dto.encryptedKey;
    newFileNode.encryptedMetadata = dto.encryptedMetadata;
    newFileNode.type = NodeType.FILE;
    newFileNode.ref = dto.encryptedFileName;
    newFileNode.encryptedParentKey = dto.encryptedParentKey;
    newFileNode.treeOwner = await this.userService.findOne(dto.userId);
    newFileNode.parent = await this.findOne(
      dto.parentId,
      dto.userId,
      NodeType.FOLDER,
    );

    // moving file from temporary folder
    Utils.moveFileFromTmpToPermanent(dto.encryptedFileName);

    // database upload
    await this.nodeRepo.save(newFileNode);

    // returns owner's trees
    return await this.getFileSystemFromUser(newFileNode.treeOwner);
  }

  /**
   * Updates a file node's reference (same as overwriting the file).
   * Moves an uploaded file from temporary folder to permanent folder.
   * Returns the updated user's trees.
   */
  async updateRef(dto: UpdateRefDto) {
    const node = await this.findOne(dto.nodeId, dto.treeOwnerId, NodeType.FILE);
    const treeOwner = await this.userService.findOne(dto.treeOwnerId);

    // moving file from temporary folder
    Utils.moveFileFromTmpToPermanent(dto.newEncryptedFileName);

    // deleting old file
    node.deleteStoredFile();

    // updating file reference
    node.ref = dto.newEncryptedFileName;

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(treeOwner);
  }

  /**
   * Updates a node's metadata.
   * Returns the updated user's trees.
   */
  async updateMetadata(dto: UpdateMetadataDto) {
    const node = await this.findOne(dto.nodeId, dto.treeOwnerId, null);
    const treeOwner = await this.userService.findOne(dto.treeOwnerId);

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
    const node = await this.findOne(dto.nodeId, dto.treeOwnerId, null);
    const treeOwner = await this.userService.findOne(dto.treeOwnerId);

    // updating parent
    node.parent = await this.findOne(
      dto.newParentId,
      dto.treeOwnerId,
      NodeType.FOLDER,
    );

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(treeOwner);
  }

  /**
   * Deletes a node by id and all of its descendant.
   * Returns the deleted target node.
   */
  async delete(dto: GetNodeDto): Promise<Node[]> {
    const node = await this.findOne(dto.nodeId, dto.treeOwnerId, null);
    const descendants = await this.nodeRepo.findDescendants(node);
    const treeOwner = await this.userService.findOne(dto.treeOwnerId);

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
