import { ErrorCode } from '../enums';
import { OidcProviderBaseRenderedException } from './oidc-provider-base-rendered.exception';

export class OidcProviderStringifyPayloadForRedisException extends OidcProviderBaseRenderedException {
  public code = ErrorCode.STRINGIFY_FOR_REDIS;
  public documentation =
    "Une erreur est survenue lors de l'enregistrement de données dans la session de l'utilisateur. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcProvider.exceptions.oidcProviderStringifyPayloadForRedis';
}
