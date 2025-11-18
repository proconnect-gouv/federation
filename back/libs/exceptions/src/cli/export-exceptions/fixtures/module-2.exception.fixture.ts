import { FcException } from '../../../exceptions';

export class ImportFixture2 extends FcException {
  public documentation = 'documentation';
  public scope = 2;
  public code = 2;
  public error = 'error';
  public error_description = 'error description';
  readonly message = 'message';
}
