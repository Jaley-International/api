import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesystemService } from './filesystem.service';
import { Express, Response } from 'express';
import {
  CreateFileDto,
  CreateFolderDto,
  GetNodeDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { diskStorage } from 'multer';
import { UploadsManager } from '../utils/uploadsManager';
import { Communication, Status } from '../utils/communication';

@Controller('filesystem')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Gets the current file system tree in its entirety.
   */
  @Get()
  async getFileSystem(): Promise<object> {
    const data = await this.fileService.getFileSystem();
    return Communication.res(
      Status.SUCCESS,
      'Successfully got all file systems.',
      data,
    );
  }

  /**
   * Gets the target node descendant tree.
   */
  @Get(':nodeid')
  async getFileSystemById(
    @Param('nodeid', ParseIntPipe) nodeId: number,
  ): Promise<object> {
    const data = await this.fileService.getFileSystem(nodeId);
    return Communication.res(
      Status.SUCCESS,
      "Successfully got node's tree",
      data,
    );
  }

  /**
   * Uploads the posted file in server disk storage into a temporary folder.
   * Returns to client the random generated file name.
   */
  @Post('content')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: UploadsManager.tmpFolder }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): object {
    const data = this.fileService.uploadFile(file);
    return Communication.res(Status.SUCCESS, 'Successfully uploaded file.', {
      ref: data,
    });
  }

  /**
   * Uploads a file object into the database architectures.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   */
  @Post('file')
  async createFile(@Body() dto: CreateFileDto): Promise<object> {
    await this.fileService.createFile(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully created new file.',
      {},
    );
  }

  /**
   * Inserts a new folder in the file system.
   */
  @Post('folder')
  async createFolder(@Body() dto: CreateFolderDto): Promise<object> {
    await this.fileService.createFolder(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully created new folder.',
      {},
    );
  }

  /**
   * Updates a node's reference.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   */
  @Patch('ref')
  async updateRef(@Body() dto: UpdateRefDto): Promise<object> {
    await this.fileService.updateRef(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully overwritten file.',
      {},
    );
  }

  /**
   * Updates a node's metadata.
   */
  @Patch('metadata')
  async updateMetadata(@Body() dto: UpdateMetadataDto): Promise<object> {
    await this.fileService.updateMetadata(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully updated file metadata.',
      {},
    );
  }

  /**
   * Moves a node inside the filesystem tree.
   */
  @Patch('parent')
  async updateParent(@Body() dto: UpdateParentDto): Promise<object> {
    await this.fileService.updateParent(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully moved file to another parent.',
      {},
    );
  }

  /**
   * Deletes a node and all of its descendants.
   */
  @Delete()
  async delete(@Body() dto: GetNodeDto): Promise<object> {
    await this.fileService.delete(dto);
    return Communication.res(Status.SUCCESS, 'Successfully deleted file.', {});
  }

  /**
   * Gets the corresponding file content of a node found by id.
   */
  @Get('content/:nodeid')
  async downloadFile(
    @Param('nodeid', ParseIntPipe) nodeId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // setting encoding method to ensure loyal data retransmission
    res.set({
      'Content-Encoding': 'identity',
    });

    // returns directly the encrypted file,
    // not encapsulated in a response body like the other routes
    return await this.fileService.getFile(nodeId);
  }
}
