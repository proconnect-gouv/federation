import { IMailerModuleOptions } from './mailer-module-options.interface';
import { IMailerParams } from '../interfaces';

export interface ITemplateAdapter {
  compile(
    transporterOptions: IMailerModuleOptions,
    mailerParams: IMailerParams,
  ): Promise<string>;
}
