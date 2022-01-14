import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, TreeRepository } from 'typeorm';
import { UploadFileDto } from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class FilesystemService {
  constructor(
    @InjectRepository(NodeEntity)
    private nodeRepository: TreeRepository<NodeEntity>,
    private userRepository: MongoRepository<UserEntity>,
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
    //TODO should return the tree structure

    const newNode = new NodeEntity();

    newNode.isFolder = false;
    newNode.encryptedKey = dto.encryptedKey;
    newNode.encryptedMetadata = dto.encryptedMetadata;
    newNode.encryptedParentKey = dto.encryptedParentKey;

    //getting file real path
    newNode.realPath = './upload/' + fileName;

    // setting workspace owner
    newNode.workspaceOwner = await this.userRepository.findOne({
      where: { id: { $eq: dto.userId } },
    });
    if (newNode.workspaceOwner === undefined) {
      throw new HttpException('workspace owner not found', HttpStatus.CONFLICT);
    }

    // setting parent folder
    newNode.parent = await this.nodeRepository.findOne({
      where: { id: { $eq: dto.parentId } },
    });
    if (newNode.parent === undefined) {
      throw new HttpException('file parent not found', HttpStatus.CONFLICT);
    }

    await this.nodeRepository.save(newNode);
    console.log('node added');

    //TODO get current workspace tree
    //TODO convert to json ?
    return await this.nodeRepository.findRoots();
  }
}
