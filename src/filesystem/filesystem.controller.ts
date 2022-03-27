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
  CreateNodeDto,
  UpdateMetadataDto,
  UpdateParentDto,
  UpdateRefDto,
} from './filesystem.dto';
import { diskStorage } from 'multer';
import { DiskFolders } from '../utils/uploads';
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
    return res("Successfully got node's tree", {
      filesystem: filesystem.node,
      authorizedUsers: filesystem.authorizedUsers,
    });
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
  async getNodeLinks(
    @Param('nodeId', ParseIntPipe) nodeId: number,
  ): Promise<ResBody> {
    const links = await this.fileService.findLinks(nodeId);
    return res('Successfully got all node links.', {
      links: links,
    });
  }

  /**
   * Inserts a new folder in the file system.
   */
  @Post('folder')
  async createFolder(
    @Req() req: Request,
    @Body() body: CreateNodeDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.createFolder(curUser, session, body);
    return res('Successfully created new folder.', {});
  }

  /**
   * Uploads the posted file in server disk storage into the permanent folder.
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: DiskFolders.PERM }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() body: CreateNodeDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.uploadFile(curUser, session, body, file);
    return res('Successfully uploaded file.', {});
  }

  /**
   * Uploads a file and updated the targeted node corresponding file to this one.
   */
  @Patch(':nodeId')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: DiskFolders.PERM }),
    }),
  )
  async updateRef(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Param('nodeId', ParseIntPipe) nodeId: number,
    @Body() body: UpdateRefDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    await this.fileService.updateRef(curUser, session, nodeId, body, file);
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
   * Gets the corresponding file content of a node found by id.
   */
  @Get(':nodeId/file')
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

  /**
   * Gets all logs related to a node.
   */
  @Get(':nodeId/logs')
  async getNodeLogs(@Param('nodeId') nodeId: number): Promise<ResBody> {
    const logs = await this.fileService.findLogs(nodeId);
    return res('Successfully got node logs.', { logs: logs });
  }

  @Get(':nodeId/shares')
  async getNodeShares(@Param('nodeId') nodeId: number): Promise<ResBody> {
    const shares = await this.fileService.findShares(nodeId);
    return res('Successfully got shared users.', { shares: shares });
  }
}
