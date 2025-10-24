import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderParseRedisResponseException extends OidcProviderBaseException {
  public code = ErrorCode.PARSE_REDIS_RESPONSE;
  public documentation =
    'Les données enregistrées dans la session utilisateurs sont corrompues, il faut recommencer la cinématique. Si le problème persiste, contacter le support N3';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcProvider.exceptions.oidcProviderParseRedisResponse';
}
