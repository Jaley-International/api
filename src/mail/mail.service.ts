import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from './../user/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, key: string) {
    const url = `example.com/auth/confirm?token=${key}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to PEC! Confirm your Email',
      template: 'confirmation',
      context: {
        name: user.username,
        url,
        key,
      },
    });
  }
}
