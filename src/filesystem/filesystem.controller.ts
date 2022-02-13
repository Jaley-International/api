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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesystemService } from './filesystem.service';
import { Express, Response, Request } from 'express';
import {
  CreateFileDto,
  CreateFolderDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { diskStorage } from 'multer';
import { DiskFolders } from '../utils/uploadsManager';
import { res, ComRes } from '../utils/communication';
import { getSessionUser } from '../utils/session';

@Controller('file-system')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Returns to client the current file system tree in its entirety.
   */
  @Get()
  async getFileSystem(): Promise<ComRes> {
    const filesystem = await this.fileService.getFileSystem();
    return res('Successfully got all file system.', { filesystem: filesystem });
  }

  /**
   * Returns to client the target node's descendant tree.
   */
  @Get(':nodeId')
  async getFileSystemById(
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ComRes> {
    const filesystem = await this.fileService.getFileSystem(nodeId);
    return res("Successfully got node's tree", { filesystem: filesystem });
  }

  /**
   * Returns to client all the links referencing the target node.
   */
  @Get(':nodeId/links')
  async getLinksByNode(
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ComRes> {
    const links = await this.fileService.getLinks(nodeId);
    return res('Successfully got all node links.', {
      links: links,
    });
  }

  /**
   * Uploads a file object into the database architectures.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   */
  @Post('file')
  async createFile(
    @Req() req: Request,
    @Body() body: CreateFileDto,
  ): Promise<ComRes> {
    const curUser = await getSessionUser(req);
    await this.fileService.createFile(curUser, body);
    return res('Successfully created new file.', {});
  }

  /**
   * Inserts a new folder in the file system.
   */
  @Post('folder')
  async createFolder(
    @Req() req: Request,
    @Body() body: CreateFolderDto,
  ): Promise<ComRes> {
    const curUser = await getSessionUser(req);
    await this.fileService.createFolder(curUser, body);
    return res('Successfully created new folder.', {});
  }

  /**
   * Updates a node's reference.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   */
  @Patch(':nodeId/ref')
  async updateRef(
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateRefDto,
  ): Promise<ComRes> {
    await this.fileService.updateRef(nodeId, body);
    return res('Successfully overwritten file.', {});
  }

  /**
   * Updates a node's metadata.
   */
  @Patch(':nodeId/metadata')
  async updateMetadata(
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateMetadataDto,
  ): Promise<ComRes> {
    await this.fileService.updateMetadata(nodeId, body);
    return res('Successfully updated file metadata.', {});
  }

  /**
   * Moves a node inside the filesystem tree.
   */
  @Patch(':nodeId/parent')
  async updateParent(
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateParentDto,
  ): Promise<ComRes> {
    await this.fileService.updateParent(nodeId, body);
    return res('Successfully moved file to another parent.', {});
  }

  /**
   * Deletes a node and all of its descendants.
   */
  @Delete(':nodeId')
  async delete(@Param('nodeId', ParseIntPipe) nodeId: number): Promise<ComRes> {
    await this.fileService.delete(nodeId);
    return res('Successfully deleted node.', {});
  }

  /**
   * Uploads the posted file in server disk storage into the temporary folder.
   * Returns to client the random generated file name.
   */
  @Post('content')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: DiskFolders.TMP }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File): ComRes {
    const ref = this.fileService.uploadFile(file);
    return res('Successfully uploaded file.', { ref: ref });
  }

  /**
   * Gets the corresponding file content of a node found by id.
   */
  @Get(':nodeId/content')
  async downloadFile(
    @Param('nodeId', ParseIntPipe) nodeId: number,
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
