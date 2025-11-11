import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderParseRedisResponseException extends OidcProviderBaseException {
  public code = ErrorCode.PARSE_REDIS_RESPONSE;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
