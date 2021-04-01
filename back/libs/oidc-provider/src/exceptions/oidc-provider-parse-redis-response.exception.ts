/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

@Description(
  "Erreur technique, recomencer la cinématique, contacter SN3 si l'erreur persiste",
)
export class OidcProviderParseRedisResponseException extends OidcProviderBaseException {
  public readonly code = ErrorCode.PARSE_REDIS_RESPONSE;
  message = 'Erreur technique';
}
