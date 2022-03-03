import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session, User } from './user.entity';
import { MailModule } from '../mail/mail.module';
import { LogModule } from '../log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session]), MailModule, LogModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
