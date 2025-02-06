import type { PropsWithHintType } from '@fc/forms';

import type { FieldValidateIfRule } from './field-validate-if-rule.interface';
import type {
  FieldValidatorBaseInterface,
  FieldValidatorInterface,
} from './field-validator.interface';

export interface FieldAttributesArguments extends PropsWithHintType {
  type?: string;
  value?: string;
  required?: boolean;

  order?: number;
  maxChars?: number;

  validateIf?: FieldValidateIfRule[];

  /*
   ** Use ArrayField component
   */
  array?: boolean;

  /*
   ** Should at least have one validator (better safe than sorry ;D)
   */
  validators: [FieldValidatorBaseInterface, ...FieldValidatorBaseInterface[]];
}

export interface FieldAttributes extends FieldAttributesArguments {
  type: string;
  name: string;
  label: string;
  order: number;
  required: boolean;

  /*
   ** Should at least have one validator (better safe than sorry ;D)
   */
  validators: [FieldValidatorInterface, ...FieldValidatorInterface[]];
}
