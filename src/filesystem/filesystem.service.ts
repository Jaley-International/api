import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import {
  CreateFileDto,
  CreateFolderDto,
  CreateRootDto,
} from './filesystem.dto';
import { Node, NodeType } from './filesystem.entity';
import { UserService } from '../user/user.service';
import { existsSync, mkdirSync, rename } from 'fs';
import { User } from '../user/user.entity';
import { Constants } from '../logic/constants';

@Injectable()
export class FilesystemService {
  constructor(
    @InjectRepository(Node)
    private nodeRepo: TreeRepository<Node>,
    private userService: UserService,
  ) {}

  //TODO get the current connected user for security verification

  async findAll(): Promise<Node[]> {
    return await this.nodeRepo.findTrees();
  }

  /**
   * Returns a folder corresponding to the id and key passed in arguments.
   * The target folder must also be in the file system tree of the user passed in parameter.
   */
  private async findFolder(
    id: number,
    key: string,
    owner: User,
  ): Promise<Node> {
    const folder = await this.nodeRepo.findOne({
      id: id,
      encryptedKey: key,
      type: NodeType.FOLDER,
      workspaceOwner: owner,
    });

    if (folder === undefined) {
      throw new HttpException('folder not found', HttpStatus.NOT_FOUND);
    }

    return folder;
  }

  /**
   * Returns the file system tree owned by the user passed in parameter.
   */
  async getFileSystemFromUser(user: User): Promise<Node[]> {
    // getting all user's roots
    const roots = await this.nodeRepo.find({
      where: { parent: null, type: NodeType.FOLDER, workspaceOwner: user },
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
   * Returns the updated file system tree.
   */
  async createRoot(dto: CreateRootDto): Promise<Node[]> {
    // creating new folder node
    const newRootNode = new Node();
    newRootNode.encryptedKey = dto.encryptedKey;
    newRootNode.encryptedMetadata = dto.encryptedMetadata;
    newRootNode.type = NodeType.FOLDER;
    newRootNode.ref = null;
    newRootNode.encryptedParentKey = null;
    newRootNode.workspaceOwner = await this.userService.findOne(dto.userId);
    newRootNode.parent = null;

    // database upload
    await this.nodeRepo.save(newRootNode);

    // return the trees owned by the user
    return await this.getFileSystemFromUser(newRootNode.workspaceOwner);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns the updated file system tree.
   */
  async createFolder(dto: CreateFolderDto): Promise<Node[]> {
    // creating new folder node
    const newFolderNode = new Node();
    newFolderNode.encryptedKey = dto.encryptedKey;
    newFolderNode.encryptedMetadata = dto.encryptedMetadata;
    newFolderNode.type = NodeType.FOLDER;
    newFolderNode.ref = null;
    newFolderNode.encryptedParentKey = dto.encryptedParentKey;
    newFolderNode.workspaceOwner = await this.userService.findOne(dto.userId);
    newFolderNode.parent = await this.findFolder(
      dto.parentId,
      dto.encryptedParentKey,
      newFolderNode.workspaceOwner,
    );

    // database upload
    await this.nodeRepo.save(newFolderNode);

    // return the trees owned by the user
    return await this.getFileSystemFromUser(newFolderNode.workspaceOwner);
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves the previous uploaded file from temporary folder to permanent folder.
   * Returns the updated file system tree.
   */
  async createFile(dto: CreateFileDto): Promise<Node[]> {
    const currentFilePath = Constants.tmpFolder + dto.encryptedFileName;
    const newFilePath = Constants.uploadFolder + dto.encryptedFileName;

    // checking if desired file exist in tmp folder
    if (!existsSync(currentFilePath)) {
      throw new HttpException(
        'expired or non existing file',
        HttpStatus.NOT_FOUND,
      );
    }

    // creating new file node
    const newFileNode = new Node();
    newFileNode.encryptedKey = dto.encryptedKey;
    newFileNode.encryptedMetadata = dto.encryptedMetadata;
    newFileNode.type = NodeType.FILE;
    newFileNode.ref = dto.encryptedFileName;
    newFileNode.encryptedParentKey = dto.encryptedParentKey;
    newFileNode.workspaceOwner = await this.userService.findOne(dto.userId);
    newFileNode.parent = await this.findFolder(
      dto.parentId,
      dto.encryptedParentKey,
      newFileNode.workspaceOwner,
    );

    // database upload
    await this.nodeRepo.save(newFileNode);

    // checks if upload directory exist, creates it if not
    // prevents error during file renaming below
    if (!existsSync(Constants.uploadFolder)) {
      mkdirSync(Constants.uploadFolder);
    }

    // moving file from temporary disk folder to permanent folder
    rename(currentFilePath, newFilePath, (err) => {
      if (err) throw err;
    });

    // return the trees owned by the user
    return await this.getFileSystemFromUser(newFileNode.workspaceOwner);
  }
}
