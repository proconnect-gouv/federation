import { Module } from '@nestjs/common';
import { GristPublisherService } from './grist-publisher.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GristPublisherService],
  exports: [GristPublisherService],
})
export class GristPublisherModule {}
