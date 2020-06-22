import { CoreFcpBaseException } from './core-fcp-base.exception';

export class CoreFcpLowAcrException extends CoreFcpBaseException {
  scope = 2; // identity provider scope
  code = 1;
}
