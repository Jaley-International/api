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
   * TODO write documentation
   */
  async createUserLog(
    activityType: ActivityType,
    subject: User,
    performer: User,
    session: Session,
  ): Promise<void> {
    const newLog = new UserLog();
    newLog.logType = LogType.USER;
    newLog.timestamp = Date.now();
    newLog.subject = subject;
    newLog.performer = performer;
    newLog.session = session;
    newLog.activityType = activityType;
    await this.userLogRepo.save(newLog);
  }
}
