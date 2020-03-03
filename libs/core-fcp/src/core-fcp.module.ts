import { Module } from '@nestjs/common';
import { OidcProviderModule } from '@fc/oidc-provider';
import { IdentityManagementService } from '@fc/identity-management';
import { SpManagementService } from '@fc/sp-management';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';

@Module({
  imports: [
    OidcProviderModule.register(IdentityManagementService, SpManagementService),
  ],
  controllers: [CoreFcpController],
  providers: [CoreFcpService],
})
export class CoreFcpModule {}
