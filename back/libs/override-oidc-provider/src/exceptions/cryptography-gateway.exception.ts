/* istanbul ignore file */

// Declarative code
import { CryptographyBaseException } from './cryptography-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';

@Description(
  'Erreur technique (communication avec le HSM), contacter le service technique',
)
export class CryptographyGatewayException extends CryptographyBaseException {
  public readonly code = ErrorCode.GATEWAY;
  message = 'Erreur technique';
}
