/* istanbul ignore file */

// Tested by DTO
import { RabbitmqConfig } from '@fc/rabbitmq';

export default {
  urls: JSON.parse(process.env.CRYPTO_BROKER_URLS),
  queue: process.env.CRYPTO_BROKER_QUEUE,
  queueOptions: {
    durable: false,
  },
  payloadEncoding: 'base64',

  // Global request timeout used for any outgoing app requests.
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
} as RabbitmqConfig;
