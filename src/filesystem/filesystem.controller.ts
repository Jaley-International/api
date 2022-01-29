import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
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
import { Node } from './filesystem.entity';
import { diskStorage } from 'multer';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Constants } from '../constants';

@Controller('fileSystem')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Get all the current file system trees.
   */
  @Get()
  @ApiResponse({ description: 'global file system' })
  async getFileSystem(): Promise<Node[]> {
    return await this.fileService.findAll();
  }

  /**
   * Get the current file system tree of a user by its id.
   */
  @Get(':userId')
  @ApiResponse({ description: "user's file system" })
  @ApiNotFoundResponse()
  async getUserFileSystem(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Node[]> {
    return await this.fileService.getFileSystemFromUserId(userId);
  }

  /**
   * Adds a new root to the file system of the specified user.
   * Returns to client the updated file system tree.
   */
  @Post('createRoot')
  @ApiCreatedResponse({ description: 'root created' })
  @ApiNotFoundResponse()
  async createRoot(@Body() dto: CreateRootDto): Promise<Node[]> {
    return await this.fileService.createRoot(dto);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns to client the updated file system tree.
   */
  @Post('createFolder')
  @ApiCreatedResponse({ description: 'folder created' })
  @ApiNotFoundResponse()
  async createFolder(@Body() dto: CreateFolderDto): Promise<Node[]> {
    return await this.fileService.createFolder(dto);
  }

  /**
   * Uploads the posted file in server disk storage into a temporary folder.
   * Returns to client the random generated file name.
   */
  @Post('uploadFile')
  @ApiCreatedResponse({ description: 'file uploaded' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: Constants.tmpFolder }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): string {
    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves the previous uploaded file from temporary folder to permanent folder.
   * Returns to client the updated file system tree.
   */
  @Post('createFile')
  @ApiCreatedResponse({ description: 'file created' })
  @ApiNotFoundResponse()
  async createFile(@Body() dto: CreateFileDto): Promise<Node[]> {
    return await this.fileService.createFile(dto);
  }
}
