import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigService } from "./config.service";

@Module({})
@Global()
export class ConfigModule {
  static forRoot(service: any): DynamicModule {
    const provider = {
      provide: ConfigService,
      useValue: service,
    };

    return {
      module: ConfigModule,
      providers: [provider],
      exports: [ConfigService],
    };
  }
}
