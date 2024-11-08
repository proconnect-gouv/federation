/* istanbul ignore file */

// Declarative code

import { ErrorCode } from '../enums';
import { OidcProviderRenderedException } from './oidc-provider-rendered.exception';

export class OidcProviderStringifyPayloadForRedisException extends OidcProviderRenderedException {
  static CODE = ErrorCode.STRINGIFY_FOR_REDIS;
  static DOCUMENTATION =
    "Une erreur est survenue lors de l'enregistrement de données dans la session de l'utilisateur. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'OidcProvider.exceptions.oidcProviderStringifyPayloadForRedis';
}
