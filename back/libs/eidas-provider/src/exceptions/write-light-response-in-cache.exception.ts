import { Description } from '@fc/error';
import { ErrorCode } from '../enums';
import { EidasProviderBaseException } from './eidas-provider-base.exception';

@Description(
  "Impossible d'écrire la LightResponse dans le cache ApacheIgnite. Le cache est probablement injoignable.",
)
export class WriteLightResponseInCacheException extends EidasProviderBaseException {
  public readonly code = ErrorCode.WRITE_LIGHT_RESPONSE_IN_CACHE;

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
