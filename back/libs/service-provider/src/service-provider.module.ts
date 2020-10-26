import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CryptographyModule } from '@fc/cryptography';
import { ServiceProviderSchema } from './schemas';
import { ServiceProviderService } from './service-provider.service';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'ServiceProvider', schema: ServiceProviderSchema },
    ]),
    CqrsModule,
  ],
  providers: [ServiceProviderService],
  exports: [ServiceProviderService, MongooseModule],
})
export class ServiceProviderModule {}
