import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  AuthenticationDto,
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
} from './user.dto';
import { UserService } from './user.service';
import { res, ComRes } from '../utils/communication';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Gets all existing users.
   */
  @Get()
  async findAll(): Promise<ComRes> {
    const data = await this.userService.findAll();
    return res('Successfully got all users.', data);
  }

  /**
   * Returns to client the target user's salt.
   */
  @Get('salt/:username')
  async getSalt(@Param('username') username: string): Promise<ComRes> {
    const data = await this.userService.getSalt(username);
    return res('Successfully got salt.', {
      salt: data,
    });
  }

  /**
   * Creates a new user.
   * Returns to client the newly created user.
   */
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<ComRes> {
    const data = await this.userService.create(dto);
    return res('Successfully created a new user account.', data);
  }

  /**
   * Authenticate a user.
   * Returns to client its login information.
   */
  @Post('login')
  async login(@Body() dto: AuthenticationDto): Promise<ComRes> {
    const data = await this.userService.login(dto);
    return res('Successfully logged in.', data);
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns to client the updated user.
   */
  @Patch()
  async update(@Body() dto: UpdateUserDto): Promise<ComRes> {
    const data = await this.userService.update(dto);
    return res('Successfully updated user account data.', data);
  }

  /**
   * Deletes a user by its username.
   * Returns to client the deleted user.
   */
  @Delete()
  async delete(@Body() dto: DeleteUserDto): Promise<ComRes> {
    const data = await this.userService.delete(dto);
    return res('Successfully deleted user and all of its filesystem.', data);
  }
}
