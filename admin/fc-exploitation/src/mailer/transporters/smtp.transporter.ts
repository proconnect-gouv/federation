import { Injectable, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigService } from 'nestjs-config';
import { IMailerParams, IMailerModuleOptions } from '../interfaces';
import { Email } from '../mailer.types';
import { Transport } from './transport';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SmtpTransport extends Transport {
  protected message: Email.SendParams;
  protected isValidMessage: ValidationError[];

  private readonly logger = new Logger('StdoutTransport');
  constructor(private readonly config: ConfigService) {
    super();
  }

  async constructMessage(
    sendParamsMessage: Email.SendParamsMessage,
    mailerParams: IMailerParams,
    transporterOptions: IMailerModuleOptions,
  ) {
    try {
      this.isValidMessage = await this.isValid(sendParamsMessage);
    } catch (error) {
      throw new Error(`The message is not valid: ${error}`);
    }

    try {
      this.message = await this.setEmailBody(
        sendParamsMessage,
        mailerParams,
        transporterOptions,
      );
    } catch (error) {
      throw new Error(`Cannot set body of email: ${error}`);
    }

    const {
      emailOptions: { from, smtpSenderName, options },
    } = transporterOptions;
    try {
      const transporter = await this.createNodeMailerTransport(
        options.host,
        options.port,
        options.secure,
      );

      const { To, Subject, HTMLPart } = this.message.Messages[0];
      const mail = await transporter.sendMail({
        from: `"${from.name}" <${from.email}>`,
        to: To[0].Email,
        subject: Subject,
        html: HTMLPart,
      });
      this.logger.log('Email sent');
      return mail;
    } catch (error) {
      this.logger.error(`Sending Email failed: ${error}`);
      throw new Error(`SMTP connection failed: ${error}`);
    }
  }

  async createNodeMailerTransport(host, port, secure) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
    });
  }
}
