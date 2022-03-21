import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { LogModule } from '../log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Link]), FilesystemModule, LogModule],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService, TypeOrmModule],
})
export class LinkModule {}
