/* istanbul ignore file */

// Declarative code

import { ErrorCode } from '../enums';
import { OidcProviderRenderedException } from './oidc-provider-rendered.exception';

export class OidcProviderParseRedisResponseException extends OidcProviderRenderedException {
  static CODE = ErrorCode.PARSE_REDIS_RESPONSE;
  static DOCUMENTATION =
    'Les données enregistrées dans la session utilisateurs sont corrompues, il faut recommencer la cinématique. Si le problème persiste, contacter le support N3';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'OidcProvider.exceptions.oidcProviderParseRedisResponse';
}
