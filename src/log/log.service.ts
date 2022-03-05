import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityType, LogType, NodeLog, UserLog } from './log.entity';
import { Session, User } from '../user/user.entity';
import { Node } from '../filesystem/filesystem.entity';
import { Link } from '../link/link.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(UserLog)
    private userLogRepo: Repository<UserLog>,
    @InjectRepository(NodeLog)
    private nodeLogRepo: Repository<NodeLog>,
  ) {}

  /**
   * Creates a new user log entry.
   */
  async createUserLog(
    activityType: ActivityType,
    subject: User,
    performer: User,
    session?: Session,
  ): Promise<void> {
    const newLog = new UserLog();
    newLog.timestamp = Date.now();
    newLog.logType = LogType.USER;
    newLog.activityType = activityType;
    newLog.subject = subject;
    newLog.performer = performer;
    if (session) {
      newLog.session = session;
    }
    await this.userLogRepo.save(newLog);
  }

  /**
   * Creates a new node log entry.
   */
  async createNodeLog(
    activityType: ActivityType,
    node: Node,
    session: Session,
    oldParent: Node,
    newParent?: Node,
    owner?: User,
    sharedWith?: User,
    sharingLink?: Link,
  ): Promise<void> {
    const newLog = new NodeLog();
    newLog.timestamp = Date.now();
    newLog.logType = LogType.NODE;
    newLog.activityType = activityType;
    newLog.node = node;
    newLog.session = session;
    newLog.oldParent = oldParent;
    if (newParent) {
      newLog.newParent = newParent;
    }
    if (owner) {
      newLog.owner = owner;
    }
    if (sharedWith) {
      newLog.sharedWith = sharedWith;
    }
    if (sharingLink) {
      newLog.sharingLink = sharingLink;
    }
    await this.nodeLogRepo.save(newLog);
  }
}
