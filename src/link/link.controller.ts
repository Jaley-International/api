import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { Communication, ComRes, Status } from '../utils/communication';
import { LinkService } from './link.service';
import { CreateLinkDto } from './link.dto';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Post()
  async createLink(@Body() dto: CreateLinkDto): Promise<ComRes> {
    const shareId = await this.linkService.createLink(dto);
    return Communication.res(Status.SUCCESS, 'Successfully created new link.', {
      shareId: shareId,
    });
  }

  //TODO move to file system module
  @Get(':nodeid')
  async getLinksByNode(
    @Param('nodeid', ParseIntPipe) nodeId: number,
  ): Promise<ComRes> {
    const links = await this.linkService.getLinksByNode(nodeId);
    return Communication.res(
      Status.SUCCESS,
      'Successfully got all node links.',
      { links: links },
    );
  }

  @Get('node/:linkId')
  async getNodeByLink(@Param('linkId') linkId: string) {
    const node = await this.linkService.getNodeByLink(linkId);
    return Communication.res(Status.SUCCESS, "Successfully got node's link", {
      node: node,
    });
  }
}
