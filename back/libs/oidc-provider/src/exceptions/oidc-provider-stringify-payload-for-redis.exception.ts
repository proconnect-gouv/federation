/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

@Description(
  "Erreur technique, recommencer la cinématique et contacter le service technique si l'erreur persiste",
)
export class OidcProviderStringifyPayloadForRedisException extends OidcProviderBaseException {
  public readonly code = ErrorCode.STRINGIFY_FOR_REDIS;
  message = 'Erreur technique, recommencez la cinématique';
}
