import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import {
  GetSaltDto,
  AuthenticationDto,
  CreateUserDto,
  LoginResponseDto,
  UpdateUserDto,
  DeleteUserDto,
} from './user.dto';
import { UserService } from './user.service';
import { UserEntity } from './user.entity';
import { DeleteResult } from 'typeorm';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Post('create')
  create(@Body() dto: CreateUserDto): Observable<UserEntity> {
    return this.userService.create(dto);
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns the updated user to the client.
   * @param dto
   */
  @Post('update')
  update(@Body() dto: UpdateUserDto): Promise<UserEntity> {
    return this.userService.update(dto);
  }

  /**
   * Delete the user possessing the id specified in the request.
   * Returns to client the DeleteResult.
   * @param dto
   */
  @Post('delete')
  delete(@Body() dto: DeleteUserDto): Promise<DeleteResult> {
    return this.userService.delete(dto);
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
