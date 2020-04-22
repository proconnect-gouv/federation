import { Module, HttpModule } from '@nestjs/common';
import {
  RnippService,
  RnippResponseParserService,
} from './services';

@Module({
  imports: [
    HttpModule,
  ],
  providers: [
    RnippService,
    RnippResponseParserService,
  ],
  exports: [
    HttpModule,
    RnippService,
    RnippResponseParserService,
  ],
})
export class RnippModule {}
