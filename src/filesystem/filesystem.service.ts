import { Injectable } from '@nestjs/common';
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
import { Communication, Status } from '../utils/communication';

@Injectable()
export class FilesystemService {
  constructor(
    @InjectRepository(Node)
    private nodeRepo: TreeRepository<Node>,
    private userService: UserService,
  ) {}

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
      where: { parent: null, type: NodeType.FOLDER, owner: user },
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
    newRoot.owner = dto.user;
    newRoot.parent = null;

    // database upload
    await this.nodeRepo.save(newRoot);

    // return the trees owned by the user
    return await this.getFileSystemFromUser(newRoot.owner);
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
    newFolder.owner = dto.user;

    newFolder.parent = await this.nodeRepo.findOne({
      where: {
        id: dto.parentId,
        type: NodeType.FOLDER,
        owner: newFolder.owner,
      },
    });

    // database upload
    await this.nodeRepo.save(newFolder);

    // returns owner's trees
    return await this.getFileSystemFromUser(newFolder.owner);
  }

  /**
   * Throws an error if the file object in argument is not (undefined, empty, not uploaded...).
   * This file will be deleted if he's still in the temporary folder after 30 seconds.
   * Returns the name of the file.
   */
  uploadFile(file: Express.Multer.File): string {
    if (file === undefined) {
      throw Communication.err(
        Status.ERROR_INVALID_FILE,
        'Non existing or invalid file has been tried to be sent.',
      );
    }
    // file will be deleted in 30 seconds
    setTimeout(() => {
      UploadFoldersManager.deleteTmpFile(file.filename);
    }, 30000);

    return file.filename;
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
    newFile.owner = dto.user;
    newFile.parent = await this.findOne({
      where: {
        id: dto.parentId,
        owner: newFile.owner,
        type: NodeType.FOLDER,
      },
    });

    // moving file from temporary folder
    UploadFoldersManager.moveFileFromTmpToPermanent(dto.ref);

    // database upload
    await this.nodeRepo.save(newFile);

    // returns owner's trees
    return await this.getFileSystemFromUser(newFile.owner);
  }

  /**
   * Updates a file node's reference (same as overwriting the file).
   * Moves an uploaded file from temporary folder to permanent folder.
   * Returns the updated user's trees.
   */
  async updateRef(dto: UpdateRefDto) {
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        owner: dto.user,
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
    return await this.getFileSystemFromUser(dto.user);
  }

  /**
   * Updates a node's metadata.
   * Returns the updated user's trees.
   */
  async updateMetadata(dto: UpdateMetadataDto) {
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        owner: dto.user,
      },
    });

    // updating meta data
    node.encryptedMetadata = dto.newEncryptedMetadata;

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(dto.user);
  }

  /**
   * Updates a node's parent (same as moving the node).
   * Returns the updated user's trees.
   */
  async updateParent(dto: UpdateParentDto) {
    // finding the node to move
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        owner: dto.user,
      },
    });

    // updating parent
    node.parent = await this.findOne({
      where: {
        id: dto.newParentId,
        owner: dto.user,
        type: NodeType.FOLDER,
      },
    });

    await this.nodeRepo.save(node);
    return await this.getFileSystemFromUser(dto.user);
  }

  /**
   * Deletes a node by id and all of its descendant.
   * Returns the deleted target node.
   */
  async delete(dto: GetNodeDto): Promise<Node[]> {
    // finding the node to delete
    const node = await this.findOne({
      where: {
        id: dto.nodeId,
        owner: dto.user,
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
    return await this.getFileSystemFromUser(dto.user);
  }

  /**
   * Find the Node entity of the file in the database
   * Return the path of the file or an error if not found
   */
  async findFile(idNumber: number): Promise<string> {
    //find  the file with exact NodeId
    const file = await this.nodeRepo.findOne({
      where: { id: idNumber },
    });
    //if found return the path
    if (file) {
      return UploadFoldersManager.uploadFolder + file.ref;
    }
    //return 404 not found if not found
    else {
      throw Communication.err(Status.ERROR_NODE_NOT_FOUND, 'file not found');
    }
  }
}
