import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { Share } from './share.entity';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { LogModule } from '../log/log.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Share]),
    UserModule,
    FilesystemModule,
    LogModule,
  ],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService, TypeOrmModule],
})
export class ShareModule {}
