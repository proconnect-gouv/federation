/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@fc/elasticsearch';
import { MongooseModule } from '@fc/mongoose';
import { ExceptionsModule } from '@fc/exceptions';
import { LoggerModule } from '@fc/logger';
import { AccountModule } from '@fc/account';
import { CryptographyFcpModule } from '@fc/cryptography-fcp';
import { CsmrTracksController } from './controllers';
import { CsmrTracksElasticsearchService, CsmrTracksService } from './services';

@Module({
  imports: [
    ExceptionsModule,
    MongooseModule,
    LoggerModule,
    ElasticsearchModule.register(),
    AccountModule,
    CryptographyFcpModule,
  ],
  controllers: [CsmrTracksController],
  providers: [CsmrTracksService, CsmrTracksElasticsearchService],
})
export class CsmrTracksModule {}
