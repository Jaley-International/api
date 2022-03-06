import { Controller, Get, Param } from '@nestjs/common';
import { LogService } from './log.service';
import { res, ResBody } from '../utils/communication';
import { UserService } from '../user/user.service';

@Controller('logs')
export class LogController {
  constructor(
    private logService: LogService,
    private userService: UserService,
  ) {}

  /**
   * Gets the target user.
   */
  @Get('node-logs/:type')
  async findNodeLogs(@Param('type') type: string): Promise<ResBody> {
    const logs = await this.logService.findAllNodeLogs({
      where: { activityType: type },
    });
    return res('Successfully got node Logs.', { nodeLogs: logs });
  }

  /**
   * Gets all logs based on the activity type on User Logs
   */
  @Get('user-logs/:type')
  async findUserLogs(@Param('type') type: string): Promise<ResBody> {
    const logs = await this.logService.findAllUserLogs({
      where: { activityType: type },
    });
    return res('Successfully got user logs.', { userLogs: logs });
  }

  /**
   * Gets all logs based on the username on Node Logs
   */
  @Get('node-logs/user/:username')
  async findNodeLogsbyUser(
    @Param('username') username: string,
  ): Promise<ResBody> {
    const user = await this.userService.findOne({
      where: { username: username },
    });
    const logs = await this.logService.findAllNodeLogs({
      where: { curUser: user },
    });
    return res('Successfully got Node logs for user.', { nodeLogs: logs });
  }

  /**
   * Gets all logs performed by an user on User Logs
   */
  @Get('user-logs/user/:username')
  async findUserLogsbyUser(
    @Param('username') username: string,
  ): Promise<ResBody> {
    const logs = await this.logService.findAllUserLogs({
      where: { performer: username },
    });
    return res('Successfully got user logs.', { userLogs: logs });
  }
}
