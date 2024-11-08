/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { CryptographyService } from '@fc/cryptography';
import { CryptographyFcpModule } from '@fc/cryptography-fcp';
import { ElasticsearchModule } from '@fc/elasticsearch';
import { ExceptionsModule, FcRmqExceptionFilter } from '@fc/exceptions';
import { GeoipMaxmindModule } from '@fc/geoip-maxmind';
import { RabbitmqModule } from '@fc/rabbitmq';
import { ScopesModule } from '@fc/scopes';

import { CsmrTracksController } from './controllers';
import {
  TracksFcpHighFormatter,
  TracksFcpLowFormatter,
  TracksLegacyFormatter,
} from './formatters';
import {
  CsmrTracksAccountService,
  CsmrTracksElasticService,
  CsmrTracksFormatterService,
  CsmrTracksGeoService,
  CsmrTracksService,
} from './services';

@Module({
  imports: [
    ExceptionsModule,
    AsyncLocalStorageModule,
    CryptographyFcpModule,
    ScopesModule.forConfig('FcpHigh'),
    ScopesModule.forConfig('FcpLow'),
    ScopesModule.forConfig('FcLegacy'),
    GeoipMaxmindModule,
    ElasticsearchModule.register(),
    RabbitmqModule.registerFor('Tracks'),
    RabbitmqModule.registerFor('AccountHigh'),
    RabbitmqModule.registerFor('AccountLegacy'),
  ],
  controllers: [CsmrTracksController],
  providers: [
    TracksFcpHighFormatter,
    TracksFcpLowFormatter,
    TracksLegacyFormatter,
    CsmrTracksGeoService,
    CsmrTracksService,
    CsmrTracksAccountService,
    CsmrTracksElasticService,
    CsmrTracksFormatterService,
    CryptographyService,
    FcRmqExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: FcRmqExceptionFilter,
    },
  ],
})
export class CsmrTracksModule {}
