import { Controller, Get } from '@nestjs/common';
import { LogService } from './log.service';
import { res, ResBody } from '../utils/communication';

@Controller('logs')
export class LogController {
  constructor(private logService: LogService) {}

  /**
   * Gets all node logs.
   */
  @Get('node-logs')
  async getNodeLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllNodeLogs();
    return res('Successfully got node logs.', { logs: logs });
  }

  /**
   * Gets all user logs.
   */
  @Get('user-logs')
  async getUserLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllUserLogs();
    return res('Successfully got user logs.', { logs: logs });
  }

  //TODO move this to node controller
  /**
   * Gets all logs related to a node.
   */
  @Get('/file-system/:nodeId/logs')
  async getLogsByNode() {
    // const logs = await this.fileService.findLogs(nodeId, ...);
    // return res('Successfully got node logs.', { logs: logs });
  }

  //TODO move this to user controller
  /**
   * Gets all logs related to a user.
   */
  @Get('/users/:username/logs')
  async getLogsByUser() {
    // const logs = await this.userService.findLogs(username, ...);
    // return res('Successfully got user logs.', { logs: logs });
  }
}
