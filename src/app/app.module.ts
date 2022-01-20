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
      url: process.env.DB_CON,
      autoLoadEntities: true,
      dropSchema: true, // remove for production
      synchronize: true, // remove for production
    }),
    UserModule,
    FilesystemModule,
  ],
})
export class AppModule {}
