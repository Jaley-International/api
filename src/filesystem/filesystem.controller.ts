import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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
  GetNodeDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { Node } from './filesystem.entity';
import { diskStorage } from 'multer';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { Utils } from '../utils';

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
   * Returns to client its updated file system tree.
   */
  @Post('createRoot')
  @ApiCreatedResponse({ description: 'root created' })
  @ApiNotFoundResponse()
  async createRoot(@Body() dto: CreateRootDto): Promise<Node[]> {
    return await this.fileService.createRoot(dto);
  }

  /**
   * Inserts a new folder in a user workspace file system.
   * Returns to client its updated file system tree.
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
      storage: diskStorage({ destination: Utils.tmpFolder }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): string {
    if (file === undefined) {
      throw new HttpException('invalid file', HttpStatus.BAD_REQUEST);
    }
    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   * Returns to client its updated file system tree.
   */
  @Post('createFile')
  @ApiCreatedResponse({ description: 'file created' })
  @ApiNotFoundResponse()
  async createFile(@Body() dto: CreateFileDto): Promise<Node[]> {
    return await this.fileService.createFile(dto);
  }

  /**
   * Updates the in-database reference to a file.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   * Returns to client its updated file system tree.
   */
  @Post('overwriteFile')
  @ApiResponse({ description: 'file overwritten' })
  @ApiNotFoundResponse()
  async updateRef(@Body() dto: UpdateRefDto): Promise<Node[]> {
    return await this.fileService.updateRef(dto);
  }

  /**
   * Updates a node's metadata.
   * Returns to client its updated file system tree.
   */
  @Post('update')
  @ApiResponse({ description: 'node updated' })
  @ApiNotFoundResponse()
  async updateMetadata(@Body() dto: UpdateMetadataDto): Promise<Node[]> {
    return await this.fileService.updateMetadata(dto);
  }

  /**
   * Moves a node inside its tree.
   * Returns to client its updated file system tree.
   */
  @Post('move')
  @ApiResponse({ description: 'node moved' })
  @ApiNotFoundResponse()
  async updateParent(@Body() dto: UpdateParentDto): Promise<Node[]> {
    return await this.fileService.updateParent(dto);
  }

  /**
   * Deletes a node by id and all of its descendant.
   * Returns to client its updated file system tree.
   */
  @Post('delete')
  @ApiResponse({ description: 'node deleted' })
  @ApiNotFoundResponse()
  async delete(@Body() dto: GetNodeDto): Promise<Node[]> {
    return await this.fileService.delete(dto);
  }
}
