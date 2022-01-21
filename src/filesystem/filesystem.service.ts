import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import {
  UploadFileDto,
  UploadFolderDto,
  UploadRootDto,
} from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { UserService } from '../user/user.service';
import { existsSync, rename } from 'fs';
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

  getFileSystem(): Promise<NodeEntity[]> {
    return this.nodeRepository.findTrees();
  }

  async findOne(id: number): Promise<NodeEntity> {
    return await this.nodeRepository.findOne({
      where: { id: id },
    });
  }

  private async findWorkspaceOwner(id: number): Promise<UserEntity> {
    const workSpaceOwner = await this.userService.findOne(id);
    if (workSpaceOwner === undefined) {
      throw new HttpException(
        'workspace owner not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return workSpaceOwner;
  }

  private async findParent(id: number): Promise<NodeEntity> {
    const parent = await this.findOne(id);
    if (parent === undefined) {
      throw new HttpException('parent not found', HttpStatus.NOT_FOUND);
    }
    return parent;
  }

  async createRoot(dto: UploadRootDto): Promise<NodeEntity[]> {
    // creating new folder node
    const newRootNode = new NodeEntity();
    newRootNode.encryptedKey = dto.encryptedKey;
    newRootNode.encryptedMetadata = dto.encryptedMetadata;
    newRootNode.isFolder = true;
    newRootNode.realPath = null;
    newRootNode.encryptedParentKey = null;
    newRootNode.workspaceOwner = await this.findWorkspaceOwner(dto.userId);
    newRootNode.parent = null;

    // database upload
    await this.nodeRepository.save(newRootNode);

    return await this.getFileSystem();
  }

  async createFolder(dto: UploadFolderDto): Promise<NodeEntity[]> {
    // creating new folder node
    const newFolderNode = new NodeEntity();
    newFolderNode.encryptedKey = dto.encryptedKey;
    newFolderNode.encryptedMetadata = dto.encryptedMetadata;
    newFolderNode.isFolder = true;
    newFolderNode.realPath = null;
    newFolderNode.encryptedParentKey = dto.encryptedParentKey;
    newFolderNode.workspaceOwner = await this.findWorkspaceOwner(dto.userId);
    newFolderNode.parent = await this.findParent(dto.parentId);

    // database upload
    await this.nodeRepository.save(newFolderNode);

    return await this.getFileSystem();
  }

  async createFile(dto: UploadFileDto): Promise<NodeEntity[]> {
    //TODO get the current connected user for security verification

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
    newFileNode.isFolder = false;
    newFileNode.realPath = newFilePath;
    newFileNode.encryptedParentKey = dto.encryptedParentKey;
    newFileNode.workspaceOwner = await this.findWorkspaceOwner(dto.userId);
    newFileNode.parent = await this.findParent(dto.parentId);

    // database upload
    await this.nodeRepository.save(newFileNode);

    // moving file from temporary disk folder to permanent folder
    rename(currentFilePath, newFilePath, (err) => {
      if (err) throw err;
    });

    return await this.getFileSystem();
  }
}
