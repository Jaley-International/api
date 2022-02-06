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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer
      .apply(sessionValidator)
      .exclude(
        { path: 'api/users', method: RequestMethod.GET },
        { path: 'api/users', method: RequestMethod.POST },
        { path: 'api/users/login', method: RequestMethod.POST },
        { path: 'api/users/salt/(.*)', method: RequestMethod.GET },
        { path: 'api/filesystem', method: RequestMethod.GET },
      )
      .forRoutes(UserController, FilesystemController);
  }
}
