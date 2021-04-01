import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CryptographyModule } from '@fc/cryptography';
import { ServiceProviderSchema } from './schemas';
import { ServiceProviderAdapterMongoService } from './service-provider-adapter-mongo.service';
import { ServiceProviderCacheInvalidateHandler } from './handlers/service-provider-cache-invalidate.handlers';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'ServiceProvider', schema: ServiceProviderSchema },
    ]),
    CqrsModule,
  ],
  providers: [
    ServiceProviderAdapterMongoService,
    ServiceProviderCacheInvalidateHandler,
  ],
  exports: [ServiceProviderAdapterMongoService, MongooseModule],
})
export class ServiceProviderAdapterMongoModule {}
