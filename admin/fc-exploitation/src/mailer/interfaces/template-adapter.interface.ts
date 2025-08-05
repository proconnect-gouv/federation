import { IMailerModuleOptions } from './mailer-module-options.interface';
import { IMailerParams } from '.';

export interface ITemplateAdapter {
  compile(
    transporterOptions: IMailerModuleOptions,
    mailerParams: IMailerParams,
  ): Promise<string>;
}
