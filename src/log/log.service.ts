import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
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
    oldParent: Node,
    newParent?: Node,
    curUser?: User,
    session?: Session,
    nodeOwner?: User,
    sharedWith?: User,
    sharingLink?: Link,
  ): Promise<void> {
    const newLog = new NodeLog();
    newLog.timestamp = Date.now();
    newLog.logType = LogType.NODE;
    newLog.activityType = activityType;
    newLog.node = node;
    newLog.oldParent = oldParent;
    if (newParent) {
      newLog.newParent = newParent;
    }
    if (curUser) {
      newLog.curUser = curUser;
    }
    if (session) {
      newLog.session = session;
    }
    if (nodeOwner) {
      newLog.nodeOwner = nodeOwner;
    }
    if (sharedWith) {
      newLog.sharedWith = sharedWith;
    }
    if (sharingLink) {
      newLog.sharingLink = sharingLink;
    }
    await this.nodeLogRepo.save(newLog);
  }

  /**
   * Returns all existing node Logs based on activity.
   */
  async findAllNodeLogs(options: FindManyOptions<NodeLog>): Promise<NodeLog[]> {
    console.log('works');
    return await this.nodeLogRepo.find(options);
  }

  /**
   * Returns all existing node Logs based on activity.
   */
  async findAllUserLogs(options: FindManyOptions<UserLog>): Promise<UserLog[]> {
    return await this.userLogRepo.find(options);
  }
}
