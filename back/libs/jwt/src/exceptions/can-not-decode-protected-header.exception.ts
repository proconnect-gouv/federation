import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotDecodeProtectedHeaderException extends JwtBaseException {
  public code = ErrorCode.CAN_NOT_DECODE_PROTECTED_HEADER;
  public documentation = 'Impossible de décoder les entêtes protégées du JWT';
  public ui = 'Jwt.exceptions.canNotDecodeProtectedHeader';
}
