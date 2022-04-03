import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Share } from './share.entity';
import { Session, User } from '../user/user.entity';
import { ShareNodeDto } from './share.dto';
import { LogService } from '../log/log.service';
import { UserService } from '../user/user.service';
import { FilesystemService } from '../filesystem/filesystem.service';
import { ActivityType } from '../log/log.entity';
import { NodeType, Node } from '../filesystem/filesystem.entity';
import { err, Status } from '../utils/communication';

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
      relations: [
        'parent',
        'owner',
        'shares',
        'shares.sender',
        'shares.recipient',
      ],
    });

    const share = new Share();
    share.shareKey = body.shareKey;
    share.shareSignature = body.shareSignature;
    share.sender = curUser;
    share.recipient = recipient;
    share.node = node;
    if (isShareValid(node, share.recipient, share.sender)) {
      await this.shareRepo.save(share);
      await this.logService.createNodeLog(
        node.type === NodeType.FILE
          ? ActivityType.FILE_SHARING
          : ActivityType.FOLDER_SHARING,
        node,
        node.parent,
        null,
        curUser,
        session,
        node.owner,
        recipient,
      );
    } else {
      throw err(Status.ERROR_INVALID_SHARE, 'Share is invalid');
    }
  }
}

/**
 * check if the current node are valid to be shared by doing the following
 * check if sender and recipient are the same if it is return false
 * check the shares array objects and check each the recipient and sender
 * if it has the same sender and recipient then return false
 */
function isShareValid(node: Node, sender: User, recipient: User): boolean {
  if (sender === recipient) {
    return false;
  }
  node.shares.forEach((share) => {
    if (share.sender === sender && share.recipient === recipient) {
      return false;
    }
  });
  return true;
}
