import { MAILER_MODULE_OPTIONS } from './mailer.constant';
import { IMailerModuleOptions } from './interfaces';

export function createTransporterProvider(
  options: IMailerModuleOptions,
): any[] {
  return [{ provide: MAILER_MODULE_OPTIONS, useValue: options || {} }];
}
