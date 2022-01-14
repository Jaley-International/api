import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { NodeEntity } from '../filesystem/filesystem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, NodeEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
