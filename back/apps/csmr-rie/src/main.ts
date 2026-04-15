import { ConfigService } from "@fc/config";
import { CsmrHttpProxyConfig } from "@fc/csmr-http-proxy";
import { NestLoggerService } from "@fc/logger";
import { RabbitmqConfig } from "@fc/rabbitmq";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import configuration from "./config";

async function bootstrap() {
  const configOptions = {
    config: configuration,
    schema: CsmrHttpProxyConfig,
  };
  const configService = new ConfigService(configOptions);

  const options = configService.get<RabbitmqConfig>("HttpProxyBroker");

  const appModule = AppModule.forRoot(configService);

  const app = await NestFactory.create(appModule, { bufferLogs: true });

  const logger = await app.resolve(NestLoggerService);
  app.useLogger(logger);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options,
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT);
  console.log(`Consumer is listening on queue "${options.queue}"`);
}

void bootstrap();
