import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { UploadFileDto } from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { UserService } from '../user/user.service';
import { existsSync, rename } from 'fs';

@Injectable()
export class FilesystemService {
  static readonly tmpFolder = './tmpUploads/';
  static readonly uploadFolder = './uploads/';

  constructor(
    @InjectRepository(NodeEntity)
    private nodeRepository: TreeRepository<NodeEntity>,
    private userService: UserService,
  ) {}

  async uploadFileOnDb(dto: UploadFileDto): Promise<NodeEntity[]> {
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
    const newNode = new NodeEntity();
    newNode.isFolder = false;
    newNode.encryptedKey = dto.encryptedKey;
    newNode.encryptedMetadata = dto.encryptedMetadata;
    newNode.encryptedParentKey = dto.encryptedParentKey;
    newNode.realPath = newFilePath;

    // setting workspace owner
    newNode.workspaceOwner = await this.userService.findOne(dto.userId);
    if (newNode.workspaceOwner === undefined) {
      throw new HttpException(
        'workspace owner not found',
        HttpStatus.NOT_FOUND,
      );
    }

    // setting parent folder
    newNode.parent = await this.findOne(dto.parentId);
    if (newNode.parent === undefined) {
      throw new HttpException('file parent not found', HttpStatus.NOT_FOUND);
    }

    // database upload
    await this.nodeRepository.save(newNode);

    // moving file from temporary disk folder to permanent folder
    rename(currentFilePath, newFilePath, (err) => {
      if (err) throw err;
    });

    return await this.nodeRepository.findTrees();
  }

  async findOne(id: number): Promise<NodeEntity> {
    return await this.nodeRepository.findOne({
      where: { id: id },
    });
  }
}
