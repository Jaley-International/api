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
import {
  AuthenticationDto,
  PreRegisterUserDto,
  RegisterUserDto,
  UpdateUserDto,
} from './user.dto';
import { UserService } from './user.service';
import { res, ResBody } from '../utils/communication';
import { Request } from 'express';
import {
  getHeaderSessionId,
  getSession,
  getSessionUser,
} from '../utils/session';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Gets all existing users.
   */
  @Get()
  async findAll(): Promise<ResBody> {
    const users = await this.userService.findAll();
    return res('Successfully got all users.', { users: users });
  }

  /**
   * Gets the target user.
   */
  @Get(':username')
  async find(@Param('username') username: string): Promise<ResBody> {
    const user = await this.userService.findOne({
      where: { username: username },
    });
    return res('Successfully got user.', { user: user });
  }

  /**
   * Returns to client the target user's salt.
   */
  @Get(':username/salt')
  async getSalt(@Param('username') username: string): Promise<ResBody> {
    const salt = await this.userService.getSalt(username);
    return res('Successfully got salt.', { salt: salt });
  }

  /**
   * Pre-registers a new user by an admin user.
   * Returns to client the newly pre-registered user.
   */
  @Post()
  async preregister(
    @Req() req: Request,
    @Body() body: PreRegisterUserDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    const user = await this.userService.preregister(curUser, session, body);
    return res('Successfully pre-registered a new user.', { user: user });
  }

  /**
   * Registers a user.
   * Returns to client the newly created user.
   */
  @Post('register')
  async register(@Body() body: RegisterUserDto): Promise<ResBody> {
    const user = await this.userService.register(body);
    return res('Successfully created a new user account.', { user: user });
  }

  /**
   * Authenticate a user.
   * Returns to client its login information.
   */
  @Post('login')
  async login(@Body() body: AuthenticationDto): Promise<ResBody> {
    const loginDetails = await this.userService.login(body);
    return res('Successfully logged in.', { loginDetails: loginDetails });
  }

  /**
   * Updates a user account parameters specified in the request.
   * Returns to client the updated user.
   */
  @Patch(':username')
  async update(
    @Req() req: Request,
    @Param('username') username: string,
    @Body() body: UpdateUserDto,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    const user = await this.userService.update(
      username,
      curUser,
      session,
      body,
    );
    return res('Successfully updated user account data.', { user: user });
  }

  /**
   * Deletes a user by its username.
   * Returns to client the deleted user.
   */
  @Delete(':username')
  async delete(
    @Req() req: Request,
    @Param('username') username: string,
  ): Promise<ResBody> {
    const curUser = await getSessionUser(req);
    const session = await getSession(req);
    const user = await this.userService.delete(username, curUser, session);
    return res('Successfully deleted user.', { user: user });
  }

  /**
   * Ends the current user session.
   */
  @Post('logout')
  async logout(@Req() req: Request) {
    const sessionId = await getHeaderSessionId(req);
    await this.userService.terminateSession(sessionId);
    return res('Successfully logged out.', {});
  }

  /**
   * Extends current session duration.
   */
  @Post('session/extend')
  async extendSession(@Req() req: Request) {
    const sessionId = await getHeaderSessionId(req);
    const newExpiration = await this.userService.extendSession(sessionId);
    return res('Successfully extended session duration', {
      expire: newExpiration,
    });
  }
}
