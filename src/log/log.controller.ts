import { Controller, Get } from '@nestjs/common';
import { LogService } from './log.service';
import { res, ResBody } from '../utils/communication';

@Controller('logs')
export class LogController {
  constructor(private logService: LogService) {}

  /**
   * Gets all user logs.
   */
  @Get('user-logs')
  async getUserLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllUserLogs();
    return res('Successfully got user logs.', { logs: logs });
  }

  /**
   * Gets all node logs.
   */
  @Get('node-logs')
  async getNodeLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllNodeLogs();
    return res('Successfully got node logs.', { logs: logs });
  }

  /**
   * Gets all node moving logs.
   */
  @Get('node-moving-logs')
  async getNodeMovingLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllNodeMovingLogs();
    return res('Successfully got node moving logs.', { logs: logs });
  }

  /**
   * Gets all link logs.
   */
  @Get('link-logs')
  async getLinkLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllLinkLogs();
    return res('Successfully got link logs.', { logs: logs });
  }

  /**
   * Gets all share logs.
   */
  @Get('share-logs')
  async getShareLogs(): Promise<ResBody> {
    const logs = await this.logService.findAllShareLogs();
    return res('Successfully got share logs.', { logs: logs });
  }
}
