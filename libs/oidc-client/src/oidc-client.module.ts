import { Module } from '@nestjs/common';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({
  providers: [OidcClientService],
  exports: [OidcClientService],
  controllers: [OidcClientController],
})
export class OidcClientModule {}
