import { Injectable } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { get } from 'lodash';

import { Message } from '../dto/message.dto';
import { Email } from '../mailer.types';
import {
  IMailerParams,
  ITemplateAdapter,
  IMailerModuleOptions,
} from '../interfaces';

/**
 * List all common function for all service ( mailjet, stdout )
 */
@Injectable()
export abstract class Transport {
  // Plain object => Class object used with plainToClass ( class-transformer )
  private messageToClass;

  /**
   *  Function to check if the body is correct ( used class-tranformer to cast a plain obejct into class obejct)
   */
  public async isValid(
    optionsMailer: Email.SendParamsMessage,
  ): Promise<ValidationError[]> {
    try {
      this.messageToClass = plainToClass(Message, optionsMailer as object);
    } catch (error) {
      throw new Error(`Cannot transform plain object to class: ${error}`);
    }

    try {
      return validate(this.messageToClass);
    } catch (errors) {
      return errors.map(data => Object.values(data.constraints));
    }
  }

  /**
   *  Function to build an correct email with a template
   */
  public async setEmailBody(
    sendParamsMessage: Email.SendParamsMessage,
    mailerParams: IMailerParams,
    transporterOptions: IMailerModuleOptions,
  ): Promise<Email.SendParams> {
    let HTMLPart: string = '';
    try {
      HTMLPart = await this.setHtmlPart(transporterOptions, mailerParams);
    } catch (error) {
      throw new Error(`Cannot generate ejs template from body: ${error}`);
    }

    const initialMail = [
      {
        From: {
          Email: sendParamsMessage.From.Email,
          Name: sendParamsMessage.From.Name,
        },
        To: sendParamsMessage.To,
        Subject: sendParamsMessage.Subject,
        HTMLPart,
      },
    ];

    if (sendParamsMessage.Attachments) {
      initialMail.map(object => ({
        ...object,
        Attachments: sendParamsMessage.Attachments,
      }));
    }

    return {
      Messages: initialMail,
    };
  }

  /**
   * Function to create a simple html content using ejs template
   */

  private async setHtmlPart(
    transporterOptions: IMailerModuleOptions,
    mailerParams: IMailerParams,
  ): Promise<string> {
    const templateAdapter: ITemplateAdapter = get(
      transporterOptions,
      'template.adapter',
    );

    return templateAdapter.compile(transporterOptions, mailerParams);
  }

  /**
   * Function as interface to define what parameters are used to build a message
   */
  abstract constructMessage(
    sendParamsMessage: Email.SendParamsMessage,
    mailerParams: IMailerParams,
    transporterOptions: IMailerModuleOptions,
  );
}
