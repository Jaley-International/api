import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LinkLog,
  NodeActivityType,
  NodeLog,
  NodeMovingLog,
  ShareLog,
  UserActivityType,
  UserLog,
} from './log.entity';
import { Session, User } from '../user/user.entity';
import { Node } from '../filesystem/filesystem.entity';
import { Link } from '../link/link.entity';
import { Share } from '../share/share.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(UserLog)
    private userLogRepo: Repository<UserLog>,
    @InjectRepository(NodeLog)
    private nodeLogRepo: Repository<NodeLog>,
    @InjectRepository(NodeMovingLog)
    private nodeMovingLogRepo: Repository<NodeMovingLog>,
    @InjectRepository(LinkLog)
    private linkLogRepo: Repository<LinkLog>,
    @InjectRepository(ShareLog)
    private shareLogRepo: Repository<ShareLog>,
  ) {}

  /**
   * Returns all existing node logs.
   */
  async findAllNodeLogs(): Promise<NodeLog[]> {
    return await this.nodeLogRepo.find({
      relations: ['node', 'Parent'],
    });
  }

  /**
   * Returns all existing user logs.
   */
  async findAllUserLogs(): Promise<UserLog[]> {
    return await this.userLogRepo.find({
      relations: ['subject,session'],
    });
  }

  /**
   * Returns all existing node moving logs.
   */
  async findAllNodeMovingLogs(): Promise<NodeMovingLog[]> {
    return await this.nodeMovingLogRepo.find({
      relations: ['session', 'oldParent', 'newParent'],
    });
  }

  /**
   * Returns all existing link logs.
   */
  async findAllLinkLogs(): Promise<LinkLog[]> {
    return await this.linkLogRepo.find({
      relations: ['session', 'link'],
    });
  }

  /**
   * Returns all existing link logs.
   */
  async findAllShareLogs(): Promise<ShareLog[]> {
    return await this.shareLogRepo.find({
      relations: ['session', 'share'],
    });
  }

  /**
   * Creates a new user log entry.
   */
  async createUserLog(
    activityType: UserActivityType,
    subject: User,
    session?: Session,
  ): Promise<void> {
    const newLog = new UserLog();

    newLog.timestamp = Date.now();
    newLog.session = session;
    newLog.subject = subject;
    newLog.type = activityType;

    await this.userLogRepo.save(newLog);
  }

  /**
   * Creates a new node log entry.
   */
  async createNodeLog(
    activityType: NodeActivityType,
    node: Node,
    parent: Node,
    session?: Session,
  ): Promise<void> {
    const newLog = new NodeLog();

    newLog.timestamp = Date.now();
    newLog.node = node;
    newLog.parent = parent;
    newLog.session = session;

    await this.nodeLogRepo.save(newLog);
  }

  /**
   * Creates a new node Moving log entry.
   */
  async createNodeMovingLog(
    node: Node,
    oldParent: Node,
    newParent: Node,
    session?: Session,
  ): Promise<void> {
    const newLog = new NodeMovingLog();

    newLog.timestamp = Date.now();
    newLog.node = node;
    newLog.oldParent = oldParent;
    newLog.newParent = newParent;
    newLog.session = session;

    await this.nodeMovingLogRepo.save(newLog);
  }

  /**
   * Creates a new Link log entry.
   */
  async createLinkLog(link: Link, session?: Session): Promise<void> {
    const newLog = new LinkLog();

    newLog.timestamp = Date.now();
    newLog.link = link;
    newLog.session = session;

    await this.nodeLogRepo.save(newLog);
  }

  /**
   * Creates a new node Moving log entry.
   */
  async createShareLog(share: Share, session?: Session): Promise<void> {
    const newLog = new ShareLog();
    newLog.timestamp = Date.now();
    newLog.share = share;
    newLog.session = session;
    await this.shareLogRepo.save(newLog);
  }
}
