import { LoggerModule } from "#libs/logger";
import { Module } from "@nestjs/common";
import { IpGeolocationService } from "./ip-geolocation.service";

@Module({
  imports: [LoggerModule],
  providers: [IpGeolocationService],
  exports: [IpGeolocationService],
})
export class IpGeolocationModule {}
