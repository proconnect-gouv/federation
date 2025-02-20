import type { PropsWithHintType } from '@fc/forms';

import type { FieldValidateIfRule, FieldValidatorInterface } from './field-validator.interface';

export interface FieldAttributes extends PropsWithHintType {
  type: string;
  name: string;
  label: string;
  order: number;
  required: boolean;
  readonly: boolean;

  value?: string;
  maxChars?: number;
  validateIf?: FieldValidateIfRule[];

  /*
   ** Use ArrayField component
   */
  array?: boolean;

  /*
   ** Should at least have one validator (better safe than sorry ;D)
   */
  validators: [FieldValidatorInterface, ...FieldValidatorInterface[]];
}
