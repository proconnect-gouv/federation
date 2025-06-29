import { FcException } from '../../../exceptions';

export const anyFunction = () => false;

export class ImportFixture extends FcException {
  public documentation = 'documentation';
  static SCOPE = 1;
  public code = 2;
  static ERROR = 'error';
  static ERROR_DESCRIPTION = 'error description';
  static UI = 'ui';
  readonly message = 'message';
  static LOG_LEVEL = 20;
}
