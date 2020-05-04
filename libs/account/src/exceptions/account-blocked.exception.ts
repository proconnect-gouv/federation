import { AccountBaseException } from './account-base.exception';

export class AccountBlockedException extends AccountBaseException {
  code = 1;
  message = 'Account blocked';
}
