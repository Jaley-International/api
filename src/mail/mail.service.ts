import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User) {
    const url = `${process.env.PEC_WEB_CLIENT_REGISTER_URL}${user.registerKey}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Private Encrypted Cloud - Account Registration',
      template: 'confirmation',
      context: {
        name: user.firstName,
        url,
        key: user.registerKey,
      },
    });
  }
}
