import { Description } from '@fc/error';
import { MockSpFcaBaseException } from './mock-sp-fca-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
@Description(
  `Erreur émise lorsqu'il y a un problème dans la récupération du userinfo`,
)
export class MockSpFcaUserinfoException extends MockSpFcaBaseException {
  code = ErrorCode.USERINFO;
}
