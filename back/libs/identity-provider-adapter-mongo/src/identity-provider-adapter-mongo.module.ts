import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CryptographyModule } from '@fc/cryptography';
import { IdentityProviderAdapterMongoService } from './identity-provider-adapter-mongo.service';
import { IdentityProviderSchema } from './schemas';
import { IdentityProviderUpdateHandler } from './handlers';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'IdentityProvider', schema: IdentityProviderSchema },
    ]),
    CqrsModule,
  ],
  providers: [
    IdentityProviderAdapterMongoService,
    IdentityProviderUpdateHandler,
  ],
  exports: [IdentityProviderAdapterMongoService, MongooseModule],
})
export class IdentityProviderAdapterMongoModule {}
