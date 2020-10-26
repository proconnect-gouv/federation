/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { CryptographyModule } from '@fc/cryptography';
import { ServiceProviderEnvService } from './service-provider-env.service';

@Module({
  imports: [CryptographyModule],
  providers: [ServiceProviderEnvService],
  exports: [ServiceProviderEnvService],
})
export class ServiceProviderEnvModule {}
