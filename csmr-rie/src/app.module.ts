import { ConfigModule, ConfigService } from "@fc/config";
import { LoggerModule } from "@fc/logger";
import { RabbitmqModule } from "@fc/rabbitmq";
import { DynamicModule, Module } from "@nestjs/common";
import { CsmrHttpProxyController, HealthController } from "./controllers";

@Module({})
export class AppModule {
  static forRoot(configService: ConfigService): DynamicModule {
    return {
      module: AppModule,
      imports: [
        // 1. Load config module first
        ConfigModule.forRoot(configService),
        // 2. Load logger module next
        LoggerModule.forRoot(),
        RabbitmqModule.registerFor("HttpProxy"),
      ],
      controllers: [CsmrHttpProxyController, HealthController],
    };
  }
}
