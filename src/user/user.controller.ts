import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { AuthenticationDto, CreateUserDto, UpdateUserDto } from './user.dto';
import { UserService } from './user.service';
import { res, ComRes } from '../utils/communication';
import { Request } from 'express';
import { getSessionId } from '../utils/session';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Gets all existing users.
   */
  @Get()
  async findAll(): Promise<ComRes> {
    const users = await this.userService.findAll();
    return res('Successfully got all users.', { users: users });
  }

  /**
   * Returns to client the target user's salt.
   */
  @Get(':username/salt')
  async getSalt(@Param('username') username: string): Promise<ComRes> {
    const salt = await this.userService.getSalt(username);
    return res('Successfully got salt.', { salt: salt });
  }

  /**
   * Creates a new user.
   * Returns to client the newly created user.
   */
  @Post()
  async create(@Body() body: CreateUserDto): Promise<ComRes> {
    const user = await this.userService.create(body);
    return res('Successfully created a new user account.', { user: user });
  }

  /**
   * Authenticate a user.
   * Returns to client its login information.
   */
  @Post('/login')
  async login(@Body() body: AuthenticationDto): Promise<ComRes> {
    const loginDetails = await this.userService.login(body);
    return res('Successfully logged in.', { loginDetails: loginDetails });
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns to client the updated user.
   */
  @Patch(':username')
  async update(
    @Param('username') username: string,
    @Body() body: UpdateUserDto,
  ): Promise<ComRes> {
    const user = await this.userService.update(username, body);
    return res('Successfully updated user account data.', { user: user });
  }

  /**
   * Deletes a user by its username.
   * Returns to client the deleted user.
   */
  @Delete(':username')
  async delete(@Param('username') username: string): Promise<ComRes> {
    const user = await this.userService.delete(username);
    return res('Successfully deleted user.', { user: user });
  }

  /**
   * Ends the current user session.
   */
  @Post('logout')
  async logout(@Req() req: Request) {
    const sessionId = await getSessionId(req);
    await this.userService.terminateSession(sessionId);
    return res('Successfully logged out.', {});
  }
}
