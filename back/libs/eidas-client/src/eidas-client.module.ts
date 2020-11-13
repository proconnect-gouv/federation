/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { EidasClientService } from './eidas-client.service';
import { EidasClientController } from './eidas-client.controller';
import { ApacheIgniteModule } from '@fc/apache-ignite';
import { EidasLightProtocolModule } from '@fc/eidas-light-protocol';

@Module({
  imports: [ApacheIgniteModule, EidasLightProtocolModule],
  providers: [EidasClientService],
  exports: [EidasClientService],
  controllers: [EidasClientController],
})
export class EidasClientModule {}
