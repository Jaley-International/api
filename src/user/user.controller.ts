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
import { User } from './user.entity';
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
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  /**
   * Creates a new user.
   * Returns to client the newly created user.
   */
  @Post('create')
  @ApiCreatedResponse({ description: 'user created' })
  @ApiConflictResponse({
    description: 'user with same username/email already exists',
  })
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.userService.create(dto);
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns to client the updated user.
   */
  @Post('update')
  @ApiResponse({ description: 'user updated' })
  @ApiNotFoundResponse()
  async update(@Body() dto: UpdateUserDto): Promise<User> {
    return await this.userService.update(dto);
  }

  /**
   * Deletes a user by id and all its personal filesystem.
   * Returns to client the deleted user.
   */
  @Post('delete')
  @ApiResponse({ description: 'user deleted' })
  @ApiNotFoundResponse()
  async delete(@Body() dto: DeleteUserDto): Promise<User> {
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
