/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';

import { EidasToOidcService, OidcToEidasService } from './services';

@Module({
  providers: [EidasToOidcService, OidcToEidasService],
  exports: [EidasToOidcService, OidcToEidasService],
})
export class EidasOidcMapperModule {}
