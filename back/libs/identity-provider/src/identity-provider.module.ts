import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { CryptographyModule } from '@fc/cryptography';
import { IdentityProviderService } from './identity-provider.service';
import { IdentityProviderSchema } from './schemas';
import { IdentityProviderOperationTypeChangesHandler } from './handlers';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'IdentityProvider', schema: IdentityProviderSchema },
    ]),
    CqrsModule,
  ],
  providers: [
    IdentityProviderService,
    IdentityProviderOperationTypeChangesHandler,
  ],
  exports: [IdentityProviderService, MongooseModule],
})
export class IdentityProviderModule {}
