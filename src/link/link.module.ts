import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './link.entity';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [TypeOrmModule.forFeature([Link]), FilesystemModule],
  controllers: [LinkController],
  providers: [LinkService],
  exports: [LinkService, TypeOrmModule],
})
export class LinkModule {}
