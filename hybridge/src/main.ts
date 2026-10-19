import amqp from "amqp-connection-manager";
import { createServer } from "node:http";
import { z } from "zod";
import { createRoutes } from "./http.ts";
import { logger } from "./logger.ts";
import { rpcConfig, setupMessageConsumer } from "./rpc.ts";

const ConfigSchema = z.object({
  Logger_THRESHOLD: z.enum([
    "debug",
    "error",
    "fatal",
    "info",
    "trace",
    "warn",
  ]),
  PORT: z.coerce.number().default(3000),
  REQUEST_TIMEOUT: z.coerce.number(),
  RieBroker_QUEUE: z.string(),
  RieBroker_URLS: z
    .string()
    .transform((value) => JSON.parse(value))
    .pipe(z.string().array()),
});

const config = ConfigSchema.parse(process.env);
logger.level = config.Logger_THRESHOLD;
rpcConfig.requestTimeout = config.REQUEST_TIMEOUT;

const connection = amqp.connect(config.RieBroker_URLS);
connection.on("connect", () => logger.info("Connected to RabbitMQ"));
connection.on("connectFailed", ({ err }) =>
  logger.error({ err }, "Failed to connect to RabbitMQ"),
);
connection.on("disconnect", ({ err }) =>
  logger.warn({ err }, "Disconnected from RabbitMQ"),
);

setupMessageConsumer(connection, config.RieBroker_QUEUE);

createServer(
  createRoutes({ isConnected: () => connection.isConnected() }),
).listen(config.PORT, () => logger.info(`Listening on port ${config.PORT}`));
