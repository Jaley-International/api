import {
  Body,
  Controller,
  Get,
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

  @Get()
  getFileSystem(): Promise<NodeEntity[]> {
    return this.fileService.getFileSystem();
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
  uploadFileDisk(@UploadedFile() file: Express.Multer.File): string {
    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves the previous uploaded file from temporary folder to permanent folder.
   * Returns to client his updated file system tree architecture.
   * @param dto
   */
  @Post('uploadFileDb')
  uploadFileDb(@Body() dto: UploadFileDto): Promise<NodeEntity[]> {
    return this.fileService.createFile(dto);
  }

  @Post('uploadFolder')
  uploadFolder(@Body() dto: UploadFolderDto): Promise<NodeEntity[]> {
    return this.fileService.createFolder(dto);
  }

  @Post('uploadRoot')
  uploadRoot(@Body() dto: UploadRootDto): Promise<NodeEntity[]> {
    return this.fileService.createRoot(dto);
  }
}
