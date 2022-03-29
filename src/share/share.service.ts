import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './share.entity';
import { Session, User } from '../user/user.entity';
import { ShareNodeDto } from './share.dto';
import { LogService } from '../log/log.service';
import { UserService } from '../user/user.service';
import { FilesystemService } from '../filesystem/filesystem.service';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(Share)
    private shareRepo: Repository<Share>,
    private userService: UserService,
    private fileService: FilesystemService,
    private logService: LogService,
  ) {}

  /**
   * Shares a node with the recipient.
   * Saves the node, node sender, node recipient, share key & share signature.
   * Logs the share activity.
   */
  async share(curUser: User, session: Session, body: ShareNodeDto) {
    const recipient = await this.userService.findOne({
      where: { username: body.recipientUsername },
    });

    const node = await this.fileService.findOne({
      where: { id: body.nodeId },
    });

    const share = new Share();
    share.shareKey = body.shareKey;
    share.shareSignature = body.shareSignature;
    share.sender = curUser;
    share.recipient = recipient;
    share.node = node;
    await this.shareRepo.save(share);

    await this.logService.createShareLog(share, session);
  }
}
