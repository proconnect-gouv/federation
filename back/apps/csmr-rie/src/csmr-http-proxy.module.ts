import { AsyncLocalStorageModule } from "@fc/async-local-storage";
import { ConfigModule, ConfigService } from "@fc/config";
import { RabbitmqConfig, RabbitmqModule } from "@fc/rabbitmq";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { CsmrHttpProxyController, HealthController } from "./controllers";
import { rawTransform, validateStatus } from "./http";
import { CsmrHttpProxyService } from "./services";

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule, AsyncLocalStorageModule],
      useFactory: (configService: ConfigService) => {
        const { requestTimeout: timeout } =
          configService.get<RabbitmqConfig>("HttpProxyBroker");
        return {
          timeout,
          validateStatus,
          transformResponse: rawTransform,
        };
      },
      inject: [ConfigService],
    }),
    RabbitmqModule.registerFor("HttpProxy"),
  ],
  controllers: [CsmrHttpProxyController, HealthController],
  providers: [CsmrHttpProxyService],
})
export class CsmrHttpProxyModule {}
