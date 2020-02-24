import { Module } from '@nestjs/common';
import { OidcProviderModule } from '@fc/oidc-provider';
import { CoreFcpController } from './core-fcp.controller';

@Module({
  imports: [OidcProviderModule],
  controllers: [CoreFcpController],
})
export class CoreFcpModule {}
