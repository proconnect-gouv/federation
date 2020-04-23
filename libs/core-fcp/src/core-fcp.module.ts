import { Module } from '@nestjs/common';

import { OidcProviderModule } from '@fc/oidc-provider';
import { IdentityModule, IdentityService } from '@fc/identity';
import {
  ServiceProviderModule,
  ServiceProviderService,
} from '@fc/service-provider';
import {
  IdentityProviderService,
  IdPmanagementModule,
} from 'libs/identity-provider/src';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';
import { ErrorModule } from '@fc/error';
import { RnippModule, RnippService } from '@fc/rnipp';

@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    IdentityModule,
    RnippModule,
    OidcProviderModule.register(
      IdentityService,
      IdentityModule,
      ServiceProviderService,
      ServiceProviderModule,
    ),
    CryptographyModule,
    OidcClientModule.register(
      IdentityService,
      IdentityModule,
      IdentityProviderService,
      IdPmanagementModule,
      RnippService,
      RnippModule,
    ),
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
