import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NodeLog, UserLog } from './log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(UserLog)
    private userLogRepo: Repository<UserLog>,
    @InjectRepository(NodeLog)
    private nodeLogRepo: Repository<NodeLog>,
  ) {}
}
