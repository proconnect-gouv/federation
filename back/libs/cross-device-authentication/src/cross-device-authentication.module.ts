import { CryptographyModule } from "#libs/cryptography";
import { IpGeolocationModule } from "#libs/ip-geolocation";
import { LoggerModule } from "#libs/logger";
import { RedisModule } from "#libs/redis";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CrossDeviceAuthenticationService } from "./cross-device-authentication.service";
import { CrossDeviceAuthenticationRequestSchema } from "./schemas";
import { XdaReviewerSessionService } from "./xda-reviewer-session.service";

@Module({
  imports: [
    CryptographyModule,
    IpGeolocationModule,
    LoggerModule,
    RedisModule,
    MongooseModule.forFeature([
      {
        name: "CrossDeviceAuthenticationRequest",
        schema: CrossDeviceAuthenticationRequestSchema,
      },
    ]),
  ],
  providers: [CrossDeviceAuthenticationService, XdaReviewerSessionService],
  exports: [CrossDeviceAuthenticationService],
})
export class CrossDeviceAuthenticationModule {}
