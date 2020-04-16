import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CryptographyModule } from '@fc/cryptography';
import { IdPManagementService } from './idp-management.service';
import { IdentityProviderSchema } from './schemas';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'IdpManagement', schema: IdentityProviderSchema },
    ]),
  ],
  providers: [IdPManagementService],
  exports: [IdPManagementService, MongooseModule],
})
export class IdPmanagementModule {}
