import { FcException } from '../../../exceptions';

export const anyFunction = () => false;

export class ImportFixture2 extends FcException {
  public documentation = 'documentation';
  public scope = 2;
  public code = 2;
  public error = 'error';
  public error_description = 'error description';
  public ui = 'ui';
  readonly message = 'message';
}
