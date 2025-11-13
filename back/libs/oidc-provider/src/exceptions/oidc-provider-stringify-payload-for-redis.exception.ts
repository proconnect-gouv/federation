import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderStringifyPayloadForRedisException extends OidcProviderBaseException {
  public code = ErrorCode.STRINGIFY_FOR_REDIS;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
