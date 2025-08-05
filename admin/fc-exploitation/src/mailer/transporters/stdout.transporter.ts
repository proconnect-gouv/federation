import { Injectable, Logger } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import { Transport } from './transport';
import { Email } from '../mailer.types';
import { IMailerParams, IMailerModuleOptions } from '../interfaces';

@Injectable()
export class StdoutTransport extends Transport {
  protected message: Email.SendParams;
  protected isValidMessage: ValidationError[];
  private readonly logger = new Logger('StdoutTransport');

  constructor() {
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

    // Use for normalize the message and add context of the logger in Nestjs
    const result = await this.logger.log(JSON.stringify(this.message, null, 2));
    return Promise.resolve(result);
  }
}
