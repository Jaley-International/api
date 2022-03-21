import { Body, Controller, Post, Req } from '@nestjs/common';
import { ShareService } from './share.service';
import { Request } from 'express';
import { getSession, getSessionUser } from '../utils/session';
import { res } from '../utils/communication';
import { ShareNodeDto } from './share.dto';

@Controller('shares')
export class ShareController {
  constructor(private shareService: ShareService) {}

  /**
   * Shares a node with another user internally.
   */
  @Post()
  async shareNode(@Req() req: Request, @Body() body: ShareNodeDto) {
    await this.shareService.share(
      await getSessionUser(req),
      await getSession(req),
      body,
    );
    return res('Successfully shared a node.', {});
  }
}
