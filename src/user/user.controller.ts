import { Body, Controller, Get, Post } from '@nestjs/common';
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
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Gets all existing users.
   */
  @Get()
  @ApiResponse({ description: 'getting all users' })
  async findAll(): Promise<UserEntity[]> {
    return await this.userService.findAll();
  }

  /**
   * Creates a new user.
   * Returns to client the newly created user.
   * @param dto
   */
  @Post('create')
  @ApiCreatedResponse({ description: 'user created' })
  @ApiConflictResponse({
    description: 'user with same username/email already exists',
  })
  create(@Body() dto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(dto);
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns to client the updated user.
   * @param dto
   */
  @Post('update')
  @ApiResponse({ description: 'user updated' })
  @ApiNotFoundResponse()
  async update(@Body() dto: UpdateUserDto): Promise<UserEntity> {
    return await this.userService.update(dto);
  }

  /**
   * Deletes the user by id.
   * Returns to client the DeleteResult.
   * @param dto
   */
  @Post('delete')
  @ApiResponse({ description: 'user deleted' })
  @ApiNotFoundResponse()
  async delete(@Body() dto: DeleteUserDto): Promise<DeleteResult> {
    return await this.userService.delete(dto);
  }

  @Post('getSalt')
  @ApiResponse({ description: 'getting salt' })
  @ApiNotFoundResponse()
  getSalt(@Body() dto: GetSaltDto): Promise<string> {
    return this.userService.getSalt(dto);
  }

  @Post('login')
  @ApiResponse({ description: 'user login' })
  @ApiNotFoundResponse()
  authentication(@Body() dto: AuthenticationDto): Promise<LoginResponseDto> {
    return this.userService.authentication(dto);
  }
}
