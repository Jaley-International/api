import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../user/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User) {
    const url = `https://pec.example.com/auth/register#${user.registerKey}`; // TODO
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to PEC! Confirm your Email',
      template: 'confirmation',
      context: {
        name: user.firstName,
        url,
        key: user.registerKey,
      },
    });
  }
}
