import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { FilesystemService } from './filesystem.service';
import { UploadFileDto } from './filesystem.dto';
import { Express } from 'express';
import { NodeEntity } from './filesystem.entity';

@Controller('fileSystem')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Uploads a file to on server disk and update the database.
   * Returns the user current workspace updated tree.
   * @param file
   * @param dto
   */
  @Post('uploadFile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './upload',
      }),
    }),
  )
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
  ): Promise<NodeEntity[]> {
    return this.fileService.uploadFile(dto, file.filename);
  }

  //TODO uploadFolder(...)

  //TODO uploadRoot(...)
}
