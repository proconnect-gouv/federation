/* istanbul ignore file */

// Tested by DTO
import { HttpProxyConfig } from '@fc/http-proxy';

export default {
  httpsProxy: process.env.HTTPS_PROXY,
} as HttpProxyConfig;
