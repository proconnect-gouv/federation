import { Module } from '@nestjs/common';

import { OidcProviderModule } from '@fc/oidc-provider';
import { IdentityManagementService } from '@fc/identity-management';
import { SpManagementModule, SpManagementService } from '@fc/sp-management';
import { IdPManagementService } from '@fc/idp-management';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';
import { ErrorModule } from '@fc/error';

@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    OidcProviderModule.register(
      IdentityManagementService,
      SpManagementService,
      SpManagementModule,
    ),
    OidcClientModule.register(IdentityManagementService, IdPManagementService),
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
