import { Module } from '@nestjs/common';

import { ApiEntrepriseService } from './services';

@Module({
  imports: [],
  providers: [ApiEntrepriseService],
  exports: [ApiEntrepriseService],
})
export class ApiEntrepriseModule {}
