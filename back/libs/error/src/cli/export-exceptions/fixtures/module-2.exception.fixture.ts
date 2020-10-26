/* istanbul ignore file */
import { FcException } from '@fc/error';

export const anyFunction = () => false;

export class ImportFixture extends FcException {
  scope = 2;
  code = 2;
  message = 'any';
}
