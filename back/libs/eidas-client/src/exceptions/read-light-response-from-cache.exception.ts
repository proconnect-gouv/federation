/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { ErrorCode } from '../enum';
import { EidasClientBaseException } from './eidas-client-base.exception';

@Description(
  'Problème de connexion entre le bridge eIDAS et le noeud eIDAS; contacter le service technique (impossible de récupérer la "LightResponse" dans le cache ApacheIgnite. L\'id est invalide, la réponse a expiré ou le cache est injoignable.)',
)
export class ReadLightResponseFromCacheException extends EidasClientBaseException {
  public readonly code = ErrorCode.READ_LIGHT_RESPONSE_FROM_CACHE;

  message = 'Erreur technique';

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
