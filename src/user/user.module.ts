import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {User} from "../entity/user";


@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [UserController],
    providers:[UserService],
    exports:[UserService,TypeOrmModule]

})
export class UserModule {}
