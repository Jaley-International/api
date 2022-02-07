import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import {
  AuthenticationDto,
  CreateUserDto,
  DeleteUserDto,
  UpdateUserDto,
} from './user.dto';
import { UserService } from './user.service';
import { Communication, ComRes, Status } from '../utils/communication';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Gets all existing users.
   */
  @Get()
  async findAll(): Promise<ComRes> {
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
  async create(@Body() dto: CreateUserDto): Promise<ComRes> {
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
  async update(@Body() dto: UpdateUserDto): Promise<ComRes> {
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
  async delete(@Body() dto: DeleteUserDto): Promise<ComRes> {
    const data = await this.userService.delete(dto);
    return Communication.res(
      Status.SUCCESS,
      'Successfully deleted user and all of its filesystem.',
      data,
    );
  }

  @Get('salt/:username')
  async getSalt(
    @Param('username') username: string,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.userService.getSalt(username);

    return res.set({ 'Access-Control-Allow-Origin': '*' }).json(
      Communication.res(Status.SUCCESS, 'Successfully got salt.', {
        salt: data,
      }),
    );

    //return Communication.res(Status.SUCCESS, 'Successfully got salt.', { salt: data, });
  }

  @Post('login')
  async login(
    @Body() dto: AuthenticationDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.userService.login(dto);

    return res
      .set({ 'Access-Control-Allow-Origin': '*' })
      .json(Communication.res(Status.SUCCESS, 'Successfully logged in.', data));
    //return Communication.res(Status.SUCCESS, 'Successfully logged in.', data);
  }
}
