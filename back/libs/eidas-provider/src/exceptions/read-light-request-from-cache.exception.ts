/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { EidasProviderBaseException } from './eidas-provider-base.exception';

@Description(
  "Problème de connexion entre le bridge eidas et le noeud eidas contacter le SN3 (Impossible de récupérer la LightRequest dans le cache ApacheIgnite. L'id est invalide, la requête a expirée ou le cache est injoignable.)",
)
export class ReadLightRequestFromCacheException extends EidasProviderBaseException {
  public readonly code = ErrorCode.READ_LIGHT_REQUEST_FROM_CACHE;
  message = 'Erreur technique';

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
