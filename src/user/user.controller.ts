import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CustomStrategy } from 'src/auth/strategies/custom.strategy';
import { LoginUserDto, LoginUserDto2, CreateUserDto } from './user.dto';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() createdUserDto: CreateUserDto): Observable<UserEntity> {
    return this.userService.create(createdUserDto);
  }

  @Post('getSalt')
  @HttpCode(200)
  login(@Body() LoginUserDto: LoginUserDto): Observable<any> {
    const salt = this.userService.login(LoginUserDto);
    console.log(salt);
    return salt;
  }

  @Post('login')
  @HttpCode(200)
  login2(@Body() LoginUserDto2: LoginUserDto2): Observable<any> {
    const salt = this.userService.login2(LoginUserDto2);
    console.log(salt);
    return salt;
  }

  @UseGuards(CustomStrategy)
  @Get()
  findAll(@Req() request): Observable<UserEntity[]> {
    console.log(request.user);
    return this.userService.findAll();
  }
}
