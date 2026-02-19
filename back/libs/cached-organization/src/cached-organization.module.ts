import { Module } from '@nestjs/common';

import { ApiEntrepriseModule } from '@fc/api-entreprise';
import { MongooseModule } from '@fc/mongoose';

import { CachedOrganizationSchema } from './schemas';
import { CachedOrganizationService } from './services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'CachedOrganization', schema: CachedOrganizationSchema },
    ]),
    ApiEntrepriseModule,
  ],
  providers: [CachedOrganizationService],
  exports: [CachedOrganizationService],
})
export class CachedOrganizationModule {}
