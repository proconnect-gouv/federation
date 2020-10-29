import { Description } from '@fc/error';
import { MockSpFcaBaseException } from './mock-sp-fca-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
@Description(
  `Erreur émise lorsqu'il y a une erreur au retour de AC sur la route de callback`,
)
export class MockSpFcaLoginCallbackException extends MockSpFcaBaseException {
  code = ErrorCode.LOGIN_CALLBACK;
}
