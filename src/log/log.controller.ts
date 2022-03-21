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
}
