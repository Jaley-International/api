import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      url: process.env.PEC_API_MYSQL_URI,
      autoLoadEntities: true,
      dropSchema: process.env.PEC_API_MODE === 'test',
      synchronize: process.env.PEC_API_MODE !== 'production',
    }),
    UserModule,
    FilesystemModule,
  ],
})
export class AppModule {}
