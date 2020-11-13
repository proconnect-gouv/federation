import { Description } from '@fc/error';
import { ErrorCode } from '../enum';
import { EidasClientBaseException } from './eidas-client-base.exception';

@Description(
  "Impossible d'écrire la LightRequest dans le cache ApacheIgnite. Le cache est probablement injoignable.",
)
export class WriteLightRequestInCacheException extends EidasClientBaseException {
  public readonly code = ErrorCode.WRITE_LIGHT_REQUEST_IN_CACHE;

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
