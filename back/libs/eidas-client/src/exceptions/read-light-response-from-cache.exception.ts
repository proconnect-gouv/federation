import { Description } from '@fc/error';
import { ErrorCode } from '../enum';
import { EidasClientBaseException } from './eidas-client-base.exception';

@Description(
  "Impossible de récupérer la LightResponse dans le cache ApacheIgnite. L'id est invalide, la réponse a expirée ou le cache est injoignable.",
)
export class ReadLightResponseFromCacheException extends EidasClientBaseException {
  public readonly code = ErrorCode.READ_LIGHT_RESPONSE_FROM_CACHE;

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
