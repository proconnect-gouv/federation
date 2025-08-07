import { ITemplateAdapter } from './template-adapter.interface';
import { ConfigOptions } from '../mailer.types';

export interface IMailerModuleOptions {
  transport: string;
  emailOptions?: {
    from: {
      name: string;
      email: string;
    };
    smtpSenderName: string;
    smtpSenderEmail: string;
    options?: ConfigOptions;
  };
  template?: {
    dir?: string;
    adapter?: ITemplateAdapter;
    options?: { [name: string]: any };
  };
}
