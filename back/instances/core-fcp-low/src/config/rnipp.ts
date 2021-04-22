/* istanbul ignore file */

// Tested by DTO
import { RnippConfig } from '@fc/rnipp';

export default {
  protocol: process.env.RNIPP_PROTOCOL,
  hostname: process.env.RNIPP_HOSTNAME,
  baseUrl: process.env.RNIPP_BASEURL,

  // Global request timeout used for any outgoing app requests.
  timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
} as RnippConfig;
