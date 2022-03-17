import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareService } from './share.service';
import { ShareController } from './share.controller';
import { Share } from './share.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Share])],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService, TypeOrmModule],
})
export class ShareModule {}
