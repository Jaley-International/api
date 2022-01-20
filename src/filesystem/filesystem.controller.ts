import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesystemService } from './filesystem.service';
import { Express } from 'express';
import { UploadFileDto } from './filesystem.dto';
import { NodeEntity } from './filesystem.entity';
import { diskStorage } from 'multer';

@Controller('fileSystem')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Uploads the posted file in server disk storage into a temporary folder.
   * Returns to client the random generated file name.
   * @param file
   */
  @Post('uploadDisk')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: FilesystemService.tmpFolder }),
    }),
  )
  uploadFileOnDisk(@UploadedFile() file: Express.Multer.File): string {
    return file.filename;
  }

  /**
   * Uploads a file object into the database architectures.
   * Moves the previous uploaded file from temporary folder to permanent folder.
   * Returns to client his updated file system tree architecture.
   * @param dto
   */
  @Post('uploadDb')
  uploadFileOnDb(@Body() dto: UploadFileDto): Promise<NodeEntity[]> {
    return this.fileService.uploadFileOnDb(dto);
  }

  //TODO uploadFolder(...)

  //TODO uploadRoot(...)
}
