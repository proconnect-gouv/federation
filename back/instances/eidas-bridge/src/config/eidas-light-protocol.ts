import { EidasLightProtocolConfig } from '@fc/eidas-light-protocol';

export default {
  lightRequestConnectorSecret:
    process.env.EidasLightProtocol_LIGHT_REQUEST_CONNECTOR_SECRET,
  lightRequestProxyServiceSecret:
    process.env.EidasLightProtocol_LIGHT_REQUEST_PROXY_SERVICE_SECRET,
  lightResponseConnectorSecret:
    process.env.EidasLightProtocol_LIGHT_RESPONSE_CONNECTOR_SECRET,
  lightResponseProxyServiceSecret:
    process.env.EidasLightProtocol_LIGHT_RESPONSE_PROXY_SERVICE_SECRET,
  maxTokenSize: parseInt(process.env.EidasLightProtocol_MAX_TOKEN_SIZE, 10),
} as EidasLightProtocolConfig;
