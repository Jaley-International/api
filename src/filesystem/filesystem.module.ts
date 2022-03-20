import { Module } from '@nestjs/common';
import { FilesystemController } from './filesystem.controller';
import { FilesystemService } from './filesystem.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './filesystem.entity';
import { LogModule } from '../log/log.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Node]), LogModule, UserModule],
  controllers: [FilesystemController],
  providers: [FilesystemService],
  exports: [FilesystemService, TypeOrmModule],
})
export class FilesystemModule {}
