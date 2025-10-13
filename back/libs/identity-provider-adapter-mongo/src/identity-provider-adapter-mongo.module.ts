import { Module } from '@nestjs/common';

import { IsUrlExtendedConstraint } from '@fc/common/validators/is-url-extended.validator';
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
  providers: [IdentityProviderAdapterMongoService, IsUrlExtendedConstraint],
  exports: [IdentityProviderAdapterMongoService],
})
export class IdentityProviderAdapterMongoModule {}
