import { Module } from '@nestjs/common';
import { FilesystemController } from './filesystem.controller';
import { FilesystemService } from './filesystem.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './filesystem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Node])],
  controllers: [FilesystemController],
  providers: [FilesystemService],
  exports: [FilesystemService, TypeOrmModule],
})
export class FilesystemModule {}
