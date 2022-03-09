import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogService } from './log.service';
import { LogController } from './log.controller';
import { NodeLog, UserLog } from './log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserLog, NodeLog])],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService, TypeOrmModule],
})
export class LogModule {}
