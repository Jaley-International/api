import { Body, Controller, Post } from '@nestjs/common';
import { Communication, Status } from '../utils/communication';
import { LinkService } from './link.service';
import { CreateLinkDto } from './link.dto';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {}

  @Post()
  async createFile(@Body() dto: CreateLinkDto): Promise<object> {
    const shareId = await this.linkService.createLink(dto);
    return Communication.res(Status.SUCCESS, 'Successfully created new link.', {
      shareId: shareId,
    });
  }
}
