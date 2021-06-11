import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CryptographyModule } from '@fc/cryptography';
import { ServiceProviderSchema } from './schemas';
import { ServiceProviderAdapterMongoService } from './service-provider-adapter-mongo.service';
import { ServiceProviderUpdateHandler } from './handlers/service-provider-update.handlers';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'ServiceProvider', schema: ServiceProviderSchema },
    ]),
    CqrsModule,
  ],
  providers: [ServiceProviderAdapterMongoService, ServiceProviderUpdateHandler],
  exports: [ServiceProviderAdapterMongoService, MongooseModule],
})
export class ServiceProviderAdapterMongoModule {}
