import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { get } from 'http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoginUserDto,CreateUserDto} from '../user/dto/user.dto';
import { UserI } from '../user/user.interface';
import { UserService } from '../user/user.service';

@Controller('users')
export class UserController {

    constructor(private userService: UserService) {}

    @Post()
    create(@Body() createdUserDto: CreateUserDto): Observable<UserI> {
        return this.userService.create(createdUserDto);
    }


    
    @Post('login')
    @HttpCode(200)
    login(@Body() LoginUserDto: LoginUserDto): Observable<string> {
        return this.userService.login(LoginUserDto);
    }

    @Get()
    findAll(@Req() request): Observable<UserI[]> {
        return this.userService.findAll();
    }


   
}