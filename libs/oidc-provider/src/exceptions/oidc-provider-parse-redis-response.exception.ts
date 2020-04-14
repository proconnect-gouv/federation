import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class OidcProviderParseRedisResponseException extends OidcProviderBaseException {
  public readonly code = ErrorCode.PARSE_REDIS_RESPONSE;
}
