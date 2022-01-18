import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { UploadFileDto } from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class FilesystemService {
  constructor(
    @InjectRepository(NodeEntity)
    private nodeRepository: TreeRepository<NodeEntity>,
    private userService: UserService,
  ) {}

  /**
   * Uploads a file into the current user workspace architecture in the database.
   * @param dto
   * @param fileName
   */
  async uploadFile(
    dto: UploadFileDto,
    fileName: string,
  ): Promise<NodeEntity[]> {
    //TODO get the current connected user for security verification

    const newNode = new NodeEntity();

    newNode.isFolder = false;
    newNode.encryptedKey = dto.encryptedKey;
    newNode.encryptedMetadata = dto.encryptedMetadata;
    newNode.encryptedParentKey = dto.encryptedParentKey;

    //getting file real path
    newNode.realPath = './upload/' + fileName;

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

    await this.nodeRepository.save(newNode);
    console.log('node added');

    //TODO get current workspace tree
    //TODO convert to json ?
    return await this.nodeRepository.findRoots();
  }

  async findOne(id: string): Promise<NodeEntity> {
    return await this.nodeRepository.findOne({
      where: { id: { $eq: id } },
    });
  }
}
