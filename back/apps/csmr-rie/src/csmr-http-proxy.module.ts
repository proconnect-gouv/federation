import { AsyncLocalStorageModule } from "@fc/async-local-storage";
import { ConfigModule, ConfigService } from "@fc/config";
import { LoggerModule } from "@fc/logger";
import { RabbitmqConfig, RabbitmqModule } from "@fc/rabbitmq";
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { CsmrHttpProxyController, HealthController } from "./controllers";
import { HttpClient } from "./dto";
import { FetchHttpModule, rawTransform, validateStatus } from "./http";
import { CsmrHttpProxyService } from "./services";

const axiosStrategy = HttpModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (svc: ConfigService) => {
    const { requestTimeout: timeout } =
      svc.get<RabbitmqConfig>("HttpProxyBroker");
    return { timeout, validateStatus, transformResponse: rawTransform };
  },
  inject: [ConfigService],
});

const fetchStrategy = FetchHttpModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (svc: ConfigService) => {
    const { requestTimeout } = svc.get<RabbitmqConfig>("HttpProxyBroker");
    return () => ({ signal: AbortSignal.timeout(requestTimeout) });
  },
  inject: [ConfigService],
});

const strategies: Record<HttpClient, DynamicModule> = {
  axios: axiosStrategy,
  fetch: fetchStrategy,
};

@Module({})
export class CsmrHttpProxyModule {
  static register({
    configService,
    httpClient = "axios",
  }: {
    configService: ConfigService;
    httpClient?: HttpClient;
  }): DynamicModule {
    return {
      module: CsmrHttpProxyModule,
      imports: [
        ConfigModule.forRoot(configService),
        LoggerModule.forRoot(),
        AsyncLocalStorageModule,
        strategies[httpClient],
        RabbitmqModule.registerFor("HttpProxy"),
      ],
      controllers: [CsmrHttpProxyController, HealthController],
      providers: [CsmrHttpProxyService],
    };
  }
}
