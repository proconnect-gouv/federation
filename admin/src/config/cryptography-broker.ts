/* istanbul ignore file */
import { parseBoolean } from '@pc/shared/transforms/parse-boolean';

// Tested by DTO
export default {
  // flag to determine if hsm had to be use or not
  useHsm: parseBoolean(process.env.USE_HSM),
  urls: JSON.parse(process.env.CRYPTO_BROKER_URLS),
  queue: process.env.CRYPTO_BROKER_QUEUE,
  queueOptions: {
    durable: false,
  },

  // Global request timeout used for any outgoing app requests.
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
};
