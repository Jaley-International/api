import { Controller, Get, Put, Param, ParseUUIDPipe, Post, Body } from '@nestjs/common';
import { UserService } from 'src/user/user.service'
import { CreateUserDto, FindUserResponseDto, UserResponseDto, UpdateUserDto,LoginUserDto } from './dto/user.dto';
import {} from '@nestjs/swagger'
import {User} from "./entity/user.entity";

@Controller('User/')
export class UserController {
    

    constructor(private readonly userService: UserService){}

    @Get()
    getUsers():Promise <User>{

        return this.userService.create("banar");
    }

    @Get()
    getuser(
        @Param('userId',new ParseUUIDPipe) userId: string 
    ):FindUserResponseDto[]{
       return this.userService.getUserbyId(userId);
    }
    
    @Post('/register')

    createUser(
        @Body() body : CreateUserDto
    ):UserResponseDto {
     return this.userService.createUser(body)
    }

    
    @Get('/login/salt')
    LoginUserGetSalt(
        @Body() body : LoginUserDto
    ):UserResponseDto {
     return this.userService.login(body)
    }

     
    @Get('/login/auth')
    LoginUserGetAuthToken(
        @Body() body : LoginUserDto
    ):UserResponseDto {
     return this.userService.login(body)
    }



    



    
}