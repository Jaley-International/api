import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesystemService } from './filesystem.service';
import { Express } from 'express';
import {
  CreateFileDto,
  CreateFolderDto,
  CreateRootDto,
  DownloadFileDto,
  GetNodeDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { diskStorage } from 'multer';
import { ApiCreatedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { createReadStream } from 'graceful-fs';
import { join } from 'path';
import { UploadFoldersManager } from '../utils/uploadFoldersManager';
import { Communication, Status } from '../utils/communication';

@Controller('filesystems')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Gets all the current file system trees.
   */
  @Get()
  async getFileSystems(): Promise<object> {
    const data = await this.fileService.findAll();
    return Communication.res(
      Status.SUCCESS,
      'Successfully got all file systems.',
      data,
    );
  }

  /**
   * Gets the current file system tree of a user by its id.
   */
  @Get(':userid')
  async getUserFileSystem(
    @Param('userid', ParseIntPipe) userId: number,
  ): Promise<object> {
    const data = await this.fileService.getFileSystemFromUserId(userId);
    return Communication.res(
      Status.SUCCESS,
      "Successfully user's file system",
      data,
    );
  }

  /**
   * Adds a new root to the file system of the specified user.
   * Returns to client its updated file system tree.
   */
  @Post('root')
  async createRoot(@Body() dto: CreateRootDto): Promise<object> {
    const data = await this.fileService.createRoot(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully added new root to user.',
      data,
    );
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns to client its updated file system tree.
   */
  @Post('folder')
  async createFolder(@Body() dto: CreateFolderDto): Promise<object> {
    const data = await this.fileService.createFolder(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully created new folder.',
      data,
    );
  }

  /**
   * Uploads the posted file in server disk storage into a temporary folder.
   * Returns to client the random generated file name.
   */
  @Post('document')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: UploadFoldersManager.tmpFolder }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): object {
    const data = this.fileService.uploadFile(file);
    return Communication.res(Status.SUCCESS, 'Successfully uploaded file.', {
      filename: data,
    });
  }

  /**
   * Uploads a file object into the database architectures.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   * Returns to client its updated file system tree.
   */
  @Post('file')
  async createFile(@Body() dto: CreateFileDto): Promise<object> {
    const data = await this.fileService.createFile(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully created new file.',
      data,
    );
  }

  /**
   * Updates the in-database reference to a file.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   * Returns to client its updated file system tree.
   */
  @Patch('file')
  async updateRef(@Body() dto: UpdateRefDto): Promise<object> {
    const data = await this.fileService.updateRef(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully overwritten file.',
      data,
    );
  }

  /**
   * Updates a node's metadata.
   * Returns to client its updated file system tree.
   */
  @Patch('metadata')
  async updateMetadata(@Body() dto: UpdateMetadataDto): Promise<object> {
    const data = await this.fileService.updateMetadata(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully updated file metadata.',
      data,
    );
  }

  /**
   * Moves a node inside its tree.
   * Returns to client its updated file system tree.
   */
  @Patch('parent')
  async updateParent(@Body() dto: UpdateParentDto): Promise<object> {
    const data = await this.fileService.updateParent(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully moved file to another parent.',
      data,
    );
  }

  /**
   * Deletes a node by id and all of its descendant.
   * Returns to client its updated file system tree.
   */
  @Delete()
  async delete(@Body() dto: GetNodeDto): Promise<object> {
    const data = await this.fileService.delete(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully deleted file.',
      data,
    );
  }

  /**
   * Download a file based on the id of the file
   * Returns to client the file.
   */
  @Post('downloadFile')
  @ApiCreatedResponse({ description: 'file created' })
  @ApiNotFoundResponse()
  async downloadFile(@Body() dto: DownloadFileDto): Promise<any> {
    const file = await this.fileService.findFile(dto.NodeId);
    const stream = createReadStream(join(process.cwd(), file));
    return new StreamableFile(stream);
  }
}
