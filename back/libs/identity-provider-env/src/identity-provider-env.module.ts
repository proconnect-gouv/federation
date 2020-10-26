/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { IdentityProviderEnvService } from './identity-provider-env.service';
import { CryptographyModule } from '@fc/cryptography';

@Module({
  imports: [CryptographyModule],
  providers: [IdentityProviderEnvService],
  exports: [IdentityProviderEnvService],
})
export class IdentityProviderEnvModule {}
