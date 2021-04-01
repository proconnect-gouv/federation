/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enum';
import { EidasClientBaseException } from './eidas-client-base.exception';

@Description(
  'Problème de connexion entre le bridge eIDAS et le noeud eIDAS; contacter le service technique (impossible de récupérer la "LightResponse" dans le cache ApacheIgnite. Le cache est probablement injoignable)',
)
export class WriteLightRequestInCacheException extends EidasClientBaseException {
  public readonly code = ErrorCode.WRITE_LIGHT_REQUEST_IN_CACHE;
  message = 'Erreur technique';

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
