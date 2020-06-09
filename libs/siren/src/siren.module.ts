/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { SirenService } from './siren.service';

@Module({
  providers: [SirenService],
  exports: [SirenService],
})
export class SirenModule {}
