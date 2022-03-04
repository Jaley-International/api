import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityType, LogType, NodeLog, UserLog } from './log.entity';
import { Session, User } from '../user/user.entity';

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
}
