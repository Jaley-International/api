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
  ValidateUserDto,
} from './user.dto';
import { UserService } from './user.service';
import { res, ResBody } from '../utils/communication';
import { Request } from 'express';
import { getHeaderSessionId, getSession } from '../utils/session';

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
   * Returns to client the registration key.
   */
  @Post()
  async preregister(
    @Req() req: Request,
    @Body() body: PreRegisterUserDto,
  ): Promise<ResBody> {
    const session = await getSession(req);
    const registerKey = await this.userService.preregister(session, body);
    return res('Successfully pre-registered a new user.', {
      registerKey: registerKey,
    });
  }

  /**
   * Registers a new user.
   * Returns to client the instance public key signature.
   */
  @Post('register')
  async register(@Body() body: RegisterUserDto): Promise<ResBody> {
    const instancePublicKeySignature = await this.userService.register(body);
    return res('Successfully registered a new user.', {
      instancePublicKeySignature: instancePublicKeySignature,
    });
  }

  /**
   * Validates a new user.
   */
  @Post('validate')
  async validate(@Req() req: Request, @Body() body: ValidateUserDto) {
    const session = await getSession(req);
    await this.userService.validate(session, body);
    return res('Successfully validated a new user.', {});
  }

  /**
   * Authenticates a user.
   * Returns to client the user's login information.
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
    const session = await getSession(req);
    const user = await this.userService.update(session, username, body);
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
    const session = await getSession(req);
    const user = await this.userService.delete(session, username);
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

  /**
   * Gets all logs related to a user.
   */
  @Get(':username/logs')
  async getLogsByUser(@Param('username') username: string): Promise<ResBody> {
    const logs = await this.userService.findLogs(username);
    return res('Successfully got user logs.', { logs: logs });
  }

  /**
   * Gets the node recipient's public sharing key and public sharing key signature.
   */
  @Get(':username/sharing-keys')
  async getSharingKeys(@Param('username') username: string): Promise<ResBody> {
    const keys = await this.userService.getSharingKeys(username);
    return res("Successfully got node recipient's sharing keys.", {
      keys: keys,
    });
  }
}
