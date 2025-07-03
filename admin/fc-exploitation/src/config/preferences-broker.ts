/* istanbul ignore file */
// Tested by DTO
import { parseBoolean } from '@fc/shared/transforms/parse-boolean';

export default {
  enabled: parseBoolean(process.env.USER_PREFERENCES_ENABLE),
  urls: JSON.parse(process.env.USER_PREFERENCES_BROKER_URLS),
  queue: process.env.USER_PREFERENCES_BROKER_QUEUE,
  queueOptions: {
    durable: false,
  },

  // Global request timeout used for any outgoing app requests.
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
};
