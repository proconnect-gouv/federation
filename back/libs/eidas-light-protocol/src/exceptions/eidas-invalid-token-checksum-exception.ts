/* istanbul ignore file */

// declarative code
import { Description, FcException } from '@fc/error';
import { ErrorCode } from '../enums';

@Description(
  'La somme de contrôle du LightToken reçu est invalide. Le token a possiblement été altéré.',
)
export class EidasInvalidTokenChecksumException extends FcException {
  public readonly code = ErrorCode.INVALID_TOKEN_CHECKSUM_EXCEPTION;
}
