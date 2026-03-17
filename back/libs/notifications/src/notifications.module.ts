import { MongooseModule } from "@fc/mongoose";
import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { NotificationsService } from "./notifications.service";
import { NotificationsSchema } from "./schemas";

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: "Notifications",
        schema: NotificationsSchema,
      },
    ]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
