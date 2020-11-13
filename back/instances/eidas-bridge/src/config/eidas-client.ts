import { EidasClientConfig } from '@fc/eidas-client';

export default {
  connectorRequestIssuer: process.env.EidasClient_CONNECTOR_REQUEST_ISSUER,
  connectorRequestCache: process.env.EidasClient_CONNECTOR_REQUEST_CACHE,
  connectorRequestCacheUrl: process.env.EidasClient_CONNECTOR_REQUEST_URL,
  connectorResponseCache: process.env.EidasClient_CONNECTOR_RESPONSE_CACHE,
} as EidasClientConfig;
