import { EidasProviderConfig } from '@fc/eidas-provider';

export default {
  proxyServiceResponseIssuer:
    process.env.EidasProvider_PROXY_SERVICE_RESPONSE_ISSUER,
  proxyServiceResponseCache:
    process.env.EidasProvider_PROXY_SERVICE_RESPONSE_CACHE,
  proxyServiceResponseCacheUrl:
    process.env.EidasProvider_PROXY_SERVICE_RESPONSE_URL,
  proxyServiceRequestCache:
    process.env.EidasProvider_PROXY_SERVICE_REQUEST_CACHE,
} as EidasProviderConfig;
