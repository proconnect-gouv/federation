import { ConfigService } from "@fc/config";
import { CsmrHttpProxyConfig, HttpClient } from "@fc/csmr-http-proxy";
import { NestLoggerService } from "@fc/logger";
import { RabbitmqConfig } from "@fc/rabbitmq";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import configuration from "./config";
import { CsmrHttpProxyModule } from "./csmr-http-proxy.module";

async function bootstrap() {
  const configService = new ConfigService({
    config: configuration,
    schema: CsmrHttpProxyConfig,
  });

  const options = configService.get<RabbitmqConfig>("HttpProxyBroker");
  const httpClient = configService.get<HttpClient>("httpClient");

  const app = await NestFactory.create(
    CsmrHttpProxyModule.register({ configService, httpClient }),
    { bufferLogs: true },
  );

  const logger = await app.resolve(NestLoggerService);
  app.useLogger(logger);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options,
  });
  await Promise.all([
    app.listen(process.env.PORT || 3000),
    app.startAllMicroservices(),
  ]);
}

void bootstrap();
