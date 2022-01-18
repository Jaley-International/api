import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  GetSaltDto,
  AuthenticationDto,
  CreateUserDto,
  LoginResponseDto,
} from './user.dto';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Post('create')
  create(@Body() dto: CreateUserDto): Observable<UserEntity> {
    console.log('success');
    return this.userService.create(dto);
  }

  @Post('getSalt')
  @HttpCode(200)
  getSalt(@Body() dto: GetSaltDto): Observable<string> {
    return this.userService.getSalt(dto);
  }

  @Post('login')
  @HttpCode(200)
  authentication(@Body() dto: AuthenticationDto): Observable<LoginResponseDto> {
    return this.userService.authentication(dto);
  }
}
