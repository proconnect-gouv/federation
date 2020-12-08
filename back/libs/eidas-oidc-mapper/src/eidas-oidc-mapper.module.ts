/* istanbul ignore file */

// Declarative codeimport { Module } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { EidasToOidcService, OidcToEidasService } from './services';

@Module({
  providers: [EidasToOidcService, OidcToEidasService],
  exports: [EidasToOidcService, OidcToEidasService],
})
export class EidasOidcMapperModule {}
