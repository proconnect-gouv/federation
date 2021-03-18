/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { ErrorCode } from '../enums';
import { EidasProviderBaseException } from './eidas-provider-base.exception';

@Description(
  "Problème de connexion entre le bridge eidas et le noeud eidas contacter le SN3 (Impossible d'écrire la LightResponse dans le cache ApacheIgnite. Le cache est probablement injoignable.)",
)
export class WriteLightResponseInCacheException extends EidasProviderBaseException {
  public readonly code = ErrorCode.WRITE_LIGHT_RESPONSE_IN_CACHE;
  message = 'Erreur technique';

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
