import { SentMessageInfo } from 'nodemailer';

import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';

import { MailOptions, Transport } from '../interfaces';

@Injectable()
export class SmtpService implements Transport {
  constructor(private readonly mailerService: MailerService) {}

  async send(params: MailOptions): Promise<SentMessageInfo> {
    const {
      subject,
      body,
      to,
      from: { name, email },
      replyTo,
      attachments,
    } = params;

    const emailInfo = await this.mailerService.sendMail({
      from: { address: email, name } as Address,
      to: to.map(({ email, name }) => ({
        address: email,
        name,
      })) as Address[],
      subject,
      attachments,
      html: body,
      ...(replyTo && {
        replyTo: {
          address: replyTo.email,
          name: replyTo.name,
        } as Address,
      }),
    });

    return emailInfo;
  }
}
