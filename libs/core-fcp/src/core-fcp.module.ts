import { Module } from '@nestjs/common';

import { OidcProviderModule } from '@fc/oidc-provider';
import { IdentityModule, IdentityService } from '@fc/identity';
import {
  ServiceProviderModule,
  ServiceProviderService,
} from '@fc/service-provider';
import {
  IdentityProviderService,
  IdentityProviderModule,
} from '@fc/identity-provider';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';
import { ErrorModule } from '@fc/error';
import { RnippModule } from '@fc/rnipp';
import { AccountModule } from '@fc/account';

@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    IdentityModule,
    RnippModule,
    CryptographyModule,
    AccountModule,
    IdentityProviderModule,
    OidcProviderModule.register(
      IdentityService,
      IdentityModule,
      ServiceProviderService,
      ServiceProviderModule,
    ),
    OidcClientModule.register(
      IdentityService,
      IdentityModule,
      IdentityProviderService,
      IdentityProviderModule,
    ),
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
