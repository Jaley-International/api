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
import { Communication, Status } from '../utils/communication';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Gets all existing users.
   */
  @Get()
  async findAll(): Promise<object> {
    const data = await this.userService.findAll();
    return Communication.res(
      Status.SUCCESS,
      'Successfully got all users.',
      data,
    );
  }

  /**
   * Creates a new user.
   * Returns to client the newly created user.
   */
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<object> {
    const data = await this.userService.create(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully created a new user account.',
      data,
    );
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns to client the updated user.
   */
  @Patch()
  async update(@Body() dto: UpdateUserDto): Promise<object> {
    const data = await this.userService.update(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully updated user account data.',
      data,
    );
  }

  /**
   * Deletes a user by id and all its personal filesystem.
   * Returns to client the deleted user.
   */
  @Delete()
  async delete(@Body() dto: DeleteUserDto): Promise<object> {
    const data = await this.userService.delete(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully deleted user and all of its filesystem.',
      data,
    );
  }

  @Get('salt/:username')
  async getSalt(@Param('username') username: string): Promise<object> {
    const data = await this.userService.getSalt(username);
    return Communication.res(Status.SUCCESS, 'Successfully got salt.', {
      salt: data,
    });
  }

  @Post('login')
  async login(@Body() dto: AuthenticationDto): Promise<object> {
    const data = await this.userService.login(dto);
    return Communication.res(Status.SUCCESS, 'Successfully logged in.', data);
  }
}
