import { Module } from '@nestjs/common';
import { OidcProviderModule } from '@fc/oidc-provider';
import { IdentityManagementService } from '@fc/identity-management';
import { SpManagementService } from '@fc/sp-management';
import { CoreFcpController } from './core-fcp.controller';

@Module({
  imports: [
    OidcProviderModule.register(IdentityManagementService, SpManagementService),
  ],
  controllers: [CoreFcpController],
})
export class CoreFcpModule {}
