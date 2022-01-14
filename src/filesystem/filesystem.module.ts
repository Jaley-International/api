import { Module } from '@nestjs/common';
import { FilesystemController } from './filesystem.controller';
import { FilesystemService } from './filesystem.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NodeEntity } from './filesystem.entity';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NodeEntity, UserEntity])],
  controllers: [FilesystemController],
  providers: [FilesystemService],
  exports: [FilesystemService, TypeOrmModule],
})
export class FilesystemModule {}
