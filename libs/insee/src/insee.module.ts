import { Module } from '@nestjs/common';
import { InseeService } from './insee.service';

@Module({
  providers: [InseeService],
  exports: [InseeService],
})
export class InseeModule {}
