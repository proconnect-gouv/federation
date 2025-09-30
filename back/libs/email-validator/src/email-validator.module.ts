import { Module } from '@nestjs/common';

import { ConfigModule } from '@fc/config';
import { IdentityProviderAdapterMongoModule } from '@fc/identity-provider-adapter-mongo';
import { LoggerModule } from '@fc/logger';

import { EmailValidatorService } from './services';

@Module({
  imports: [
    LoggerModule.forRoot(),
    IdentityProviderAdapterMongoModule,
    ConfigModule,
  ],
  providers: [EmailValidatorService],
  exports: [EmailValidatorService],
})
export class EmailValidatorModule {}
