import { CryptographyBaseException } from './cryptography-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class CryptographyGatewayException extends CryptographyBaseException {
  public readonly code = ErrorCode.GATEWAY;
}
