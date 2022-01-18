import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { FilesystemModule } from '../filesystem/filesystem.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_CONNECTION,
      autoLoadEntities: true,
      synchronize: true,
      useUnifiedTopology: true,
    }),
    UserModule,
    FilesystemModule,
  ],
})
export class AppModule {}
