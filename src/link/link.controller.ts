import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { res, ResBody } from '../utils/communication';
import { LinkService } from './link.service';
import { CreateLinkDto } from './link.dto';
import { Request } from 'express';
import { getSession, getSessionUser } from '../utils/session';

@Controller('links')
export class LinkController {
  constructor(private linkService: LinkService) {}

  /**
   * Creates a new sharing link which redirects to the download of a node.
   * Returns to client the generated id link (share id).
   */
  @Post()
  async createLink(
    @Req() req: Request,
    @Body() body: CreateLinkDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    const shareId = await this.linkService.createLink(curUser, session, body);
    return res('Successfully created new link.', {
      shareId: shareId,
    });
  }

  /**
   * Returns to client the node referenced by the target link.
   */
  @Get(':linkId/node')
  async getNodeByLink(@Param('linkId') linkId: string): Promise<ResBody> {
    const node = await this.linkService.getNode(linkId);
    const link = await this.linkService.findById(linkId);
    return res("Successfully got node's link", {
      link: link,
      node: node,
    });
  }
}
