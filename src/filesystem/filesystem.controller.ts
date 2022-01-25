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
  CreateFileDto,
  CreateFolderDto,
  CreateRootDto,
} from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { diskStorage } from 'multer';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('fileSystem')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Get the current file system tree.
   */
  @Get()
  @ApiResponse({ description: 'global file system' })
  async getFileSystem(): Promise<NodeEntity[]> {
    return await this.fileService.findAll();
  }

  /**
   * Get the current file system tree of a user by its id.
   * @param params number
   */
  @Get(':userId')
  @ApiResponse({ description: "user's file system" })
  @ApiNotFoundResponse()
  async getUserFileSystem(@Param() params): Promise<NodeEntity[]> {
    return await this.fileService.getFileSystemFromUserId(params.userId);
  }

  /**
   * Adds a new root to the file system of the specified user.
   * Returns to client the updated file system tree.
   * @param dto
   */
  @Post('createRoot')
  @ApiCreatedResponse({ description: 'root created' })
  @ApiNotFoundResponse()
  async createRoot(@Body() dto: CreateRootDto): Promise<NodeEntity[]> {
    return await this.fileService.createRoot(dto);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns to client the updated file system tree.
   * @param dto
   */
  @Post('createFolder')
  @ApiCreatedResponse({ description: 'folder created' })
  @ApiNotFoundResponse()
  async createFolder(@Body() dto: CreateFolderDto): Promise<NodeEntity[]> {
    return await this.fileService.createFolder(dto);
  }

  /**
   * Uploads the posted file in server disk storage into a temporary folder.
   * Returns to client the random generated file name.
   * @param file
   */
  @Post('uploadFile')
  @ApiCreatedResponse({ description: 'file uploaded' })
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
  @Post('createFile')
  @ApiCreatedResponse({ description: 'file created' })
  @ApiNotFoundResponse()
  async createFile(@Body() dto: CreateFileDto): Promise<NodeEntity[]> {
    return await this.fileService.createFile(dto);
  }
}
