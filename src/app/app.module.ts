import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { FilesystemModule } from '../filesystem/filesystem.module';
import { sessionValidator } from './app.middleware';
import { FilesystemController } from '../filesystem/filesystem.controller';
import { UserController } from '../user/user.controller';
import { LinkModule } from '../link/link.module';
import { LinkController } from '../link/link.controller';
import { MailModule } from '../mail/mail.module';

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
    LinkModule,
    MailModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(sessionValidator)
      .exclude(
        { path: 'api/users/register', method: RequestMethod.POST },
        { path: 'api/users/login', method: RequestMethod.POST },
        { path: 'api/users/(.*)/salt', method: RequestMethod.GET },
        { path: '/links/:shareId/node', method: RequestMethod.GET },
      )
      .forRoutes(UserController, FilesystemController, LinkController);
  }
}
