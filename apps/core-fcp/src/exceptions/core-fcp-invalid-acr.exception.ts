import { CoreFcpBaseException } from './core-fcp-base.exception';

export class CoreFcpInvalidAcrException extends CoreFcpBaseException {
  scope = 2; // identity provider scope
  code = 2;
}
