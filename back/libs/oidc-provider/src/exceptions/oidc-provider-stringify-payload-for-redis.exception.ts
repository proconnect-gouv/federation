import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class OidcProviderStringifyPayloadForRedisException extends OidcProviderBaseException {
  public readonly code = ErrorCode.STRINGIFY_FOR_REDIS;
}
