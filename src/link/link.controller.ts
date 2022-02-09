import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { res, ComRes } from '../utils/communication';
import { LinkService } from './link.service';
import { CreateLinkDto } from './link.dto';

@Controller('links')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Post()
  async createLink(@Body() dto: CreateLinkDto): Promise<ComRes> {
    const shareId = await this.linkService.createLink(dto);
    return res('Successfully created new link.', {
      shareId: shareId,
    });
  }

  @Get(':linkId/node')
  async getNodeByLink(@Param('linkId') linkId: string): Promise<ComRes> {
    const node = await this.linkService.getNode(linkId);
    const link = await this.linkService.findById(linkId);
    return res("Successfully got node's link", {
      link: link,
      node: node,
    });
  }
}
