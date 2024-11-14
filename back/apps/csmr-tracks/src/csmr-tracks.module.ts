/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { CsmrAccountClientModule } from '@fc/csmr-account-client';
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
  CsmrTracksElasticService,
  CsmrTracksFormatterService,
  CsmrTracksGeoService,
  CsmrTracksService,
} from './services';

@Module({
  imports: [
    ExceptionsModule,
    AsyncLocalStorageModule,
    ScopesModule.forConfig('FcpHigh'),
    ScopesModule.forConfig('FcpLow'),
    ScopesModule.forConfig('FcLegacy'),
    GeoipMaxmindModule,
    ElasticsearchModule.register(),
    RabbitmqModule.registerFor('Tracks'),
    CsmrAccountClientModule,
  ],
  controllers: [CsmrTracksController],
  providers: [
    TracksFcpHighFormatter,
    TracksFcpLowFormatter,
    TracksLegacyFormatter,
    CsmrTracksGeoService,
    CsmrTracksService,
    CsmrTracksElasticService,
    CsmrTracksFormatterService,
    FcRmqExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: FcRmqExceptionFilter,
    },
  ],
})
export class CsmrTracksModule {}
