import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SpManagementSchema } from './schemas/sp.schema';
import { SpManagementService } from './sp-management.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'SpManagement', schema: SpManagementSchema },
    ]),
  ],
  providers: [SpManagementService],
  exports: [SpManagementService, MongooseModule],
})
export class SpManagementModule {}
