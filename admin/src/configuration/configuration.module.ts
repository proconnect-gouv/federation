import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TotpService } from "../authentication/totp/totp.service";
import { LocalsInterceptor } from "../meta/locals.interceptor";
import { ConfigurationController } from "./configuration.controller";
import { ConfigurationService } from "./configuration.service";
import { Configuration } from "./entity/configuration.mongodb.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Configuration], "fc-mongo")],
  controllers: [ConfigurationController],
  providers: [LocalsInterceptor, ConfigurationService, TotpService],
})
export class ConfigurationModule {}
