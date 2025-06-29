import { FcException } from '../../../exceptions';

export const anyFunction = () => false;

export class ImportFixture extends FcException {
  public documentation = 'documentation';
  public scope = 1;
  public code = 2;
  static ERROR = 'error';
  static ERROR_DESCRIPTION = 'error description';
  public ui = 'ui';
  readonly message = 'message';
}
