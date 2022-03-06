import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesystemService } from './filesystem.service';
import { Express, Request, Response } from 'express';
import {
  CreateFileDto,
  CreateFolderDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { diskStorage } from 'multer';
import { DiskFolders } from '../utils/uploadsManager';
import { res, ResBody } from '../utils/communication';
import { getSession, getSessionUser } from '../utils/session';

@Controller('file-system')
export class FilesystemController {
  constructor(private fileService: FilesystemService) {}

  /**
   * Returns to client the current file system tree in its entirety.
   */
  @Get()
  async getFileSystem(@Req() req: Request): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const filesystem = await this.fileService.getFileSystem(curUser);
    return res('Successfully got file system.', { filesystem: filesystem });
  }

  /**
   * Returns to client the target node's descendant tree.
   */
  @Get(':nodeId')
  async getFileSystemById(
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const filesystem = await this.fileService.getFileSystem(curUser, nodeId);
    return res("Successfully got node's tree", { filesystem: filesystem });
  }

  /**
   * Returns to client the target node's parent list.
   */
  @Get(':nodeId/path')
  async getNodePath(
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const filesystem = await this.fileService.getNodeParentList(
      curUser,
      nodeId,
    );
    return res("Successfully got node's path", { path: filesystem });
  }

  /**
   * Returns to client all the links referencing the target node.
   */
  @Get(':nodeId/links')
  async getLinksByNode(
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ResBody> {
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
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.createFile(curUser, session, body);
    return res('Successfully created new file.', {});
  }

  /**
   * Inserts a new folder in the file system.
   */
  @Post('folder')
  async createFolder(
    @Req() req: Request,
    @Body() body: CreateFolderDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.createFolder(curUser, session, body);
    return res('Successfully created new folder.', {});
  }

  /**
   * Updates a node's reference.
   * This requires to have previously uploaded a file
   * in order to move it from temporary folder to permanent folder.
   */
  @Patch(':nodeId/ref')
  async updateRef(
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateRefDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.updateRef(curUser, session, nodeId, body);
    return res('Successfully overwritten file.', {});
  }

  /**
   * Updates a node's metadata.
   */
  @Patch(':nodeId/metadata')
  async updateMetadata(
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateMetadataDto,
  ): Promise<ResBody> {
    await this.fileService.updateMetadata(nodeId, body);
    return res('Successfully updated file metadata.', {});
  }

  /**
   * Moves a node inside the filesystem tree.
   */
  @Patch(':nodeId/parent')
  async updateParent(
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateParentDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.updateParent(curUser, session, nodeId, body);
    return res('Successfully moved node to another parent.', {});
  }

  /**
   * Deletes a node and all of its descendants.
   */
  @Delete(':nodeId')
  async delete(
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.delete(curUser, session, nodeId);
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
  uploadFile(@UploadedFile() file: Express.Multer.File): ResBody {
    const ref = this.fileService.uploadFile(file);
    return res('Successfully uploaded file.', { ref: ref });
  }

  /**
   * Gets the corresponding file content of a node found by id.
   */
  @Get(':nodeId/content')
  async downloadFile(
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    // setting encoding method to ensure loyal data retransmission
    res.set({
      'Content-Encoding': 'identity',
    });
    // returns directly the encrypted file,
    // not encapsulated in a response body like the other routes
    return await this.fileService.getFile(curUser, session, nodeId);
  }
}
