import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Communication, ComRes } from '../utils/communication';
import { LinkService } from './link.service';
import { CreateLinkDto } from './link.dto';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Post()
  async createLink(@Body() dto: CreateLinkDto): Promise<ComRes> {
    const shareId = await this.linkService.createLink(dto);
    return Communication.res('Successfully created new link.', {
      shareId: shareId,
    });
  }

  //TODO move to file system module
  @Get(':nodeid')
  async getLinksByNode(
    @Param('nodeid', ParseIntPipe) nodeId: number,
  ): Promise<ComRes> {
    const links = await this.linkService.getLinksByNode(nodeId);
    return Communication.res('Successfully got all node links.', {
      links: links,
    });
  }

  @Get('node/:linkid')
  async getNodeByLink(@Param('linkid') linkId: string): Promise<ComRes> {
    const node = await this.linkService.getNodeByLink(linkId);
    const link = await this.linkService.findById(linkId);
    return Communication.res("Successfully got node's link", {
      link: link,
      node: node,
    });
  }
}
