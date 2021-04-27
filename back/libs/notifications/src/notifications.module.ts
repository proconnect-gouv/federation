/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { NotificationsSchema } from './schemas';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: 'Notifications',
        schema: NotificationsSchema,
      },
    ]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService, MongooseModule],
})
export class NotificationsModule {}
