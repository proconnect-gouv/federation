import { IMailerModuleOptions } from './mailer-module-options.interface';

export interface IMailerOptionsFactory {
  createMailerOptions(): Promise<IMailerModuleOptions> | IMailerModuleOptions;
}
