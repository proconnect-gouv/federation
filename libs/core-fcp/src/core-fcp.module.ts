import { Module } from '@nestjs/common';

import { OidcProviderModule } from '@fc/oidc-provider';
import {
  IdentityManagementModule,
  IdentityManagementService,
} from '@fc/identity-management';
import { SpManagementModule, SpManagementService } from '@fc/sp-management';
import { IdPManagementService } from '@fc/idp-management';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import {
  CryptographyGatewayHighModule,
  CryptographyGatewayHighService,
} from '@fc/cryptography-gateway-high';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';
import { ErrorModule } from '@fc/error';

@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    IdentityManagementModule,
    OidcProviderModule.register(
      IdentityManagementService,
      IdentityManagementModule,
      SpManagementService,
      SpManagementModule,
    ),
    CryptographyGatewayHighModule,
    CryptographyModule.register(CryptographyGatewayHighService),
    OidcClientModule.register(
      IdentityManagementService,
      IdentityManagementModule,
      IdPManagementService,
    ),
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
