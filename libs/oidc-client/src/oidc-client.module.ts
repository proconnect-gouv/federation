import { Module } from '@nestjs/common';
import { OidcClientService } from './oidc-client.service';

@Module({
  providers: [OidcClientService],
  exports: [OidcClientService],
})
export class OidcClientModule {}
