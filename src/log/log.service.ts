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
   * Returns all existing node logs.
   */
  async findAllNodeLogs(): Promise<NodeLog[]> {
    return await this.nodeLogRepo.find();
  }

  /**
   * Returns all existing user logs.
   */
  async findAllUserLogs(): Promise<UserLog[]> {
    return await this.userLogRepo.find();
  }

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

    newLog.session = session;

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
    owner?: User,
    sharedWith?: User,
    link?: Link,
  ): Promise<void> {
    const newLog = new NodeLog();

    newLog.timestamp = Date.now();
    newLog.logType = LogType.NODE;
    newLog.activityType = activityType;
    newLog.node = node;
    newLog.oldParent = oldParent;

    newLog.newParent = newParent;
    newLog.curUser = curUser;
    newLog.session = session;
    newLog.owner = owner;
    newLog.sharedWith = sharedWith;
    newLog.link = link;

    await this.nodeLogRepo.save(newLog);
  }
}
