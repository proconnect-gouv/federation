import { Description } from '@fc/error';
import { MockSpFcaBaseException } from './mock-sp-fca-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
@Description(
  `Erreur émise lorsqu'il y a une erreur au moment de la révocation du token`,
)
export class MockSpFcaTokenRevocationException extends MockSpFcaBaseException {
  code = ErrorCode.TOKEN_REVOCATION;
}
