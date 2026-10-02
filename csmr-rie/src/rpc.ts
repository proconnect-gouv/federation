import type { AmqpConnectionManager, Channel } from "amqp-connection-manager";
import type { ConsumeMessage } from "amqplib";
import { z } from "zod";
import { logger } from "./logger.ts";

const MessageType = { DATA: "TYPE::DATA", ERROR: "TYPE::ERROR" };
const INTERNAL_ERROR = { message: "Internal server error", status: "error" };
const NO_MESSAGE_HANDLER =
  "There is no matching message handler defined in the remote service.";

const BridgePayloadSchema = z.object({
  data: z.string().nullish(),
  headers: z.record(z.string(), z.any()),
  method: z
    .string()
    .transform((method) => method.toLowerCase())
    .pipe(z.enum(["get", "post"])),
  url: z.url({ protocol: /^https?$/ }),
});

async function proxyRequest(payload: unknown) {
  const { data, headers, method, url } = BridgePayloadSchema.parse(payload);
  logger.debug(
    { payload: { data, headers, method, url } },
    "received HTTP_PROXY command",
  );
  const { origin, pathname } = new URL(url);
  const request = `${method.toUpperCase()} ${origin}${pathname}`;
  const start = performance.now();
  const elapsed = () => `${Math.round(performance.now() - start)}ms`;
  logger.info(`--> ${request}`);
  try {
    const res = await fetch(url, {
      body: data || null,
      headers: new Headers(headers),
      method,
    });
    logger.info(`<-- ${request} ${res.status} ${elapsed()}`);
    return {
      data: {
        data: await res.text(),
        headers: Object.fromEntries(res.headers.entries()),
        status: res.status,
        statusText: res.statusText,
      },
      type: MessageType.DATA,
    };
  } catch (error: any) {
    const errorData = {
      code: error.cause?.code || error.code,
      name: error.cause?.name || error.name,
      reason: `${error.message}${error.cause?.message ? ` (${error.cause.message})` : ""}`,
    };
    logger.error({ errorData }, `xxx ${request} ${elapsed()}`);
    return { data: errorData, type: MessageType.ERROR };
  }
}

const handlers: Record<string, (data: unknown) => Promise<unknown>> = {
  HTTP_PROXY: proxyRequest,
  ping: async () => "pong",
};

export async function handlePacket({
  data,
  id,
  pattern,
}: {
  data?: unknown;
  id: string;
  pattern: string;
}) {
  const handler = Object.hasOwn(handlers, pattern) && handlers[pattern];
  if (!handler) return { err: NO_MESSAGE_HANDLER, id, status: "error" };
  try {
    return { isDisposed: true, response: await handler(data) };
  } catch (err) {
    logger.error({ err }, `Unhandled error in ${pattern} handler`);
    return { err: INTERNAL_ERROR, isDisposed: true };
  }
}

export function setupMessageConsumer(
  connection: AmqpConnectionManager,
  queue: string,
) {
  const channel = connection.createChannel({
    setup: (channel: Channel) => channel.assertQueue(queue, { durable: true }),
  });

  channel.on("error", (err) => logger.error({ err }, "Channel error"));

  channel.consume(
    queue,
    async ({ content, properties }: ConsumeMessage) => {
      const { correlationId, replyTo } = properties;
      try {
        const packet = JSON.parse(content.toString());
        if (packet?.id === undefined || !replyTo)
          return logger.error("Ignoring message without id or replyTo");
        const message = `${packet.pattern} ${correlationId}`;
        const start = performance.now();
        logger.info(`--> ${message}`);
        const reply = await handlePacket(packet);
        const outcome = "err" in reply ? "error" : "ok";
        logger.info(
          `<-- ${message} ${outcome} ${Math.round(performance.now() - start)}ms`,
        );
        await channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(reply)), {
          correlationId,
        });
      } catch (err) {
        logger.error({ err }, "Failed to handle message");
      }
    },
    { noAck: true },
  );
}
