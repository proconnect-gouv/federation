import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { MinistriesSchema } from './schemas';
import { MinistriesService } from './ministries.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: 'Ministries',
        schema: MinistriesSchema,
      },
    ]),
  ],
  providers: [MinistriesService],
  exports: [MinistriesService, MongooseModule],
})
export class MinistriesModule {}
