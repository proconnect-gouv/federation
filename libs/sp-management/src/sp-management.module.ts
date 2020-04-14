import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import { SpManagementSchema } from './schemas/sp.schema';
import { SpManagementService } from './sp-management.service';

@Module({
  imports: [
    CryptographyModule,
    MongooseModule.forFeature([
      { name: 'SpManagement', schema: SpManagementSchema },
    ]),
  ],
  providers: [SpManagementService],
  exports: [SpManagementService, MongooseModule],
})
export class SpManagementModule {}
