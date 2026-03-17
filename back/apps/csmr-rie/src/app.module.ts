import { ConfigModule, ConfigService } from "@fc/config";
import { LoggerModule } from "@fc/logger";
import { DynamicModule, Module } from "@nestjs/common";
import { CsmrHttpProxyModule } from "./csmr-http-proxy.module";

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
        // 3. Load other modules
        CsmrHttpProxyModule,
      ],
    };
  }
}
