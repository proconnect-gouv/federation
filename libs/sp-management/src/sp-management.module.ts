import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CryptographyModule } from '@fc/cryptography';
import { ServiceProviderSchema } from './schemas';
import { SpManagementService } from './sp-management.service';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'SpManagement', schema: ServiceProviderSchema },
    ]),
  ],
  providers: [SpManagementService],
  exports: [SpManagementService, MongooseModule],
})
export class SpManagementModule {}
