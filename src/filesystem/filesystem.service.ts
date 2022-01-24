import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import {
  UploadFileDto,
  UploadFolderDto,
  UploadRootDto,
} from './filesystem.dto';
import { NodeEntity, NodeType } from './filesystem.entity';
import { UserService } from '../user/user.service';
import { existsSync, mkdirSync, rename } from 'fs';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class FilesystemService {
  static readonly tmpFolder = './tmpUploads/';
  static readonly uploadFolder = './uploads/';

  constructor(
    @InjectRepository(NodeEntity)
    private nodeRepository: TreeRepository<NodeEntity>,
    private userService: UserService,
  ) {}

  //TODO get the current connected user for security verification

  async findAll(): Promise<NodeEntity[]> {
    return await this.nodeRepository.findTrees();
  }

  private async findFolder(
    id: number,
    key: string,
    owner: UserEntity,
  ): Promise<NodeEntity> {
    const folder = await this.nodeRepository.findOne({
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
   * @param user
   */
  async getFileSystemFromUser(user: UserEntity): Promise<NodeEntity[]> {
    // getting all user workspaces roots
    const roots = await this.nodeRepository.find({
      where: { parent: null, type: NodeType.FOLDER, workspaceOwner: user },
    });
    if (roots.length === 0) {
      throw new HttpException('no roots found', HttpStatus.NOT_FOUND);
    }

    // getting all different roots trees
    const trees = [];
    for (const root of roots) {
      trees.push(await this.nodeRepository.findDescendantsTree(root));
    }
    return trees;
  }

  /**
   * Returns the file system tree owned by the user passed in parameter.
   * @param userId
   */
  async getFileSystemFromUserId(userId: number): Promise<NodeEntity[]> {
    const user = await this.userService.findOne(userId);
    return await this.getFileSystemFromUser(user);
  }

  /**
   * Adds a new root to the file system.
   * This root is interpreted as a new workspace for the user uploading it.
   * Returns the updated file system tree.
   * @param dto
   */
  async createRoot(dto: UploadRootDto): Promise<NodeEntity[]> {
    // creating new folder node
    const newRootNode = new NodeEntity();
    newRootNode.encryptedKey = dto.encryptedKey;
    newRootNode.encryptedMetadata = dto.encryptedMetadata;
    newRootNode.type = NodeType.FOLDER;
    newRootNode.ref = null;
    newRootNode.encryptedParentKey = null;
    newRootNode.workspaceOwner = await this.userService.findOne(dto.userId);
    newRootNode.parent = null;

    // database upload
    await this.nodeRepository.save(newRootNode);

    return await this.getFileSystemFromUser(newRootNode.workspaceOwner);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns the updated file system tree.
   * @param dto
   */
  async createFolder(dto: UploadFolderDto): Promise<NodeEntity[]> {
    // creating new folder node
    const newFolderNode = new NodeEntity();
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
    await this.nodeRepository.save(newFolderNode);

    return await this.getFileSystemFromUser(newFolderNode.workspaceOwner);
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves the previous uploaded file from temporary folder to permanent folder.
   * Returns the updated file system tree.
   * @param dto
   */
  async createFile(dto: UploadFileDto): Promise<NodeEntity[]> {
    const currentFilePath = FilesystemService.tmpFolder + dto.encryptedFileName;
    const newFilePath = FilesystemService.uploadFolder + dto.encryptedFileName;

    // checking if desired file exist in tmp folder
    if (!existsSync(currentFilePath)) {
      throw new HttpException(
        'expired or non existing file',
        HttpStatus.NOT_FOUND,
      );
    }

    // creating new file node
    const newFileNode = new NodeEntity();
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
    await this.nodeRepository.save(newFileNode);

    // checking if upload directory exist, creating it if not
    // prevents error during file renaming below
    if (!existsSync(FilesystemService.uploadFolder)) {
      mkdirSync(FilesystemService.uploadFolder);
    }

    // moving file from temporary disk folder to permanent folder
    rename(currentFilePath, newFilePath, (err) => {
      if (err) throw err;
    });

    return await this.getFileSystemFromUser(newFileNode.workspaceOwner);
  }
}
