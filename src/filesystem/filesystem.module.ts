import { Module } from '@nestjs/common';
import { FilesystemController } from './filesystem.controller';
import { FilesystemService } from './filesystem.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Node } from './filesystem.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Node]), UserModule],
  controllers: [FilesystemController],
  providers: [FilesystemService],
  exports: [FilesystemService, TypeOrmModule],
})
export class FilesystemModule {}
