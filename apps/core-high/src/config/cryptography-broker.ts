import { RabbitmqConfig } from '@fc/rabbitmq';

export default {
  urls: JSON.parse(process.env.CRYPTO_BROKER_URLS),
  queue: process.env.CRYPTO_BROKER_QUEUE,
  queueOptions: {
    durable: false,
  },
  payloadEncoding: 'base64',
} as RabbitmqConfig;
