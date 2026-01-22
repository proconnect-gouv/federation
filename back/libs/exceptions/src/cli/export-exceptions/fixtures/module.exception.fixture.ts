import { BaseException } from '../../../exceptions';

export class ImportFixture extends BaseException {
  public documentation = 'documentation';
  public scope = 1;
  public code = 2;
  public error = 'error';
  public error_description = 'error description';
  readonly message = 'message';
}
