import { Module } from '@nestjs/common';

import { ConfigModule } from '@fc/config';
import { FqdnToIdpAdapterMongoModule } from '@fc/fqdn-to-idp-adapter-mongo';
import { LoggerModule } from '@fc/logger';

import { EmailValidatorService } from './services';

@Module({
  imports: [LoggerModule.forRoot(), FqdnToIdpAdapterMongoModule, ConfigModule],
  providers: [EmailValidatorService],
  exports: [EmailValidatorService],
})
export class EmailValidatorModule {}
