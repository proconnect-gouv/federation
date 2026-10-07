import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CrossDeviceAuthenticationService } from "./cross-device-authentication.service";
import { CrossDeviceAuthenticationRequestSchema } from "./schemas";
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: "CrossDeviceAuthenticationRequest",
        schema: CrossDeviceAuthenticationRequestSchema,
      },
    ]),
  ],
  providers: [CrossDeviceAuthenticationService],
  exports: [CrossDeviceAuthenticationService],
})
export class CrossDeviceAuthenticationModule {}
