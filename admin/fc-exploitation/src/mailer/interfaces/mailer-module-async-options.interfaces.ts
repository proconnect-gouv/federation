import { ModuleMetadata, Type } from '@nestjs/common/interfaces';

import { IMailerModuleOptions } from './mailer-module-options.interface';
import { IMailerOptionsFactory } from './mailer-options-factory.interfaces';

/**
 * Supporting Multiple Async Options Providers Techniques into our Dynamic Module.
 *
 * 1- useClass - to get a private instance of the options provider.
 * 2- useFactory - to use a function as the options provider.
 * 3- useExisting - to re-use an existing (shared, SINGLETON) service as the options provider.
 * 4- inject - to inject a service into the factory function ( ex: configService if is already instanciate in the module context )
 */

export interface IMailerModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<IMailerOptionsFactory>;
  useClass?: Type<IMailerOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<IMailerModuleOptions> | IMailerModuleOptions;
  inject?: any[];
}
