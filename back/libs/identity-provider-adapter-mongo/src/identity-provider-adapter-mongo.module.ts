import { Module } from '@nestjs/common';

import { IsIncludedInConfigConstraint } from '@fc/common';
import { CryptographyModule } from '@fc/cryptography';
import { MongooseModule } from '@fc/mongoose';

import { IdentityProviderAdapterMongoService } from './identity-provider-adapter-mongo.service';
import { IdentityProviderSchema } from './schemas';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'IdentityProvider', schema: IdentityProviderSchema },
    ]),
  ],
  providers: [
    IdentityProviderAdapterMongoService,
    IsIncludedInConfigConstraint,
  ],
  exports: [IdentityProviderAdapterMongoService],
})
export class IdentityProviderAdapterMongoModule {}
