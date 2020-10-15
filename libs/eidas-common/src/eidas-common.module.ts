/*istanbul ignore file*/

// Declarative code
import { Module } from '@nestjs/common';
import { EidasCommonService } from './eidas-common.service';

@Module({
  providers: [EidasCommonService],
  exports: [EidasCommonService],
})
export class EidasCommonModule {}
