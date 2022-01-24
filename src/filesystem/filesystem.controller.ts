import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesystemService } from './filesystem.service';
import { Express } from 'express';
import {
  UploadFileDto,
  UploadFolderDto,
  UploadRootDto,
} from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { diskStorage } from 'multer';

@Controller('fileSystem')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Returns to client the current file system tree.
   */
  @Get()
  getFileSystem(): Promise<NodeEntity[]> {
    return this.fileService.findAll();
  }

  /**
   * Returns to client the current file system tree owned by the specified user.
   * @param params
   */
  @Get(':id')
  getUserFileSystem(@Param() params): Promise<NodeEntity[]> {
    return this.fileService.getFileSystemFromUserId(params.id);
  }

  /**
   * Adds a new root to the file system.
   * This root is interpreted as a new workspace for the user uploading it.
   * Returns to client the updated file system tree.
   * @param dto
   */
  @Post('uploadRoot')
  createRoot(@Body() dto: UploadRootDto): Promise<NodeEntity[]> {
    return this.fileService.createRoot(dto);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns to client the updated file system tree.
   * @param dto
   */
  @Post('uploadFolder')
  createFolder(@Body() dto: UploadFolderDto): Promise<NodeEntity[]> {
    return this.fileService.createFolder(dto);
  }

  /**
   * Uploads the posted file in server disk storage into a temporary folder.
   * Returns to client the random generated file name.
   * @param file
   */
  @Post('uploadFileDisk')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: FilesystemService.tmpFolder }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): string {
    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves the previous uploaded file from temporary folder to permanent folder.
   * Returns the updated file system tree.
   * @param dto
   */
  @Post('uploadFileDb')
  createFile(@Body() dto: UploadFileDto): Promise<NodeEntity[]> {
    return this.fileService.createFile(dto);
  }
}
