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
import { GetSaltDto, AuthenticationDto, CreateUserDto } from './user.dto';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Observable<UserEntity> {
    return this.userService.create(dto);
  }

  @Post('getSalt')
  @HttpCode(200)
  getSalt(@Body() dto: GetSaltDto): Observable<any> {
    const salt = this.userService.getSalt(dto);
    console.log(salt);
    return salt;
  }

  @Post('login')
  @HttpCode(200)
  authentication(@Body() dto: AuthenticationDto): Observable<any> {
    const salt = this.userService.authentication(dto);
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
