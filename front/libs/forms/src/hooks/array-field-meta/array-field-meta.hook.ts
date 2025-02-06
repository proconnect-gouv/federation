import classnames from 'classnames';
import type { FieldValidator } from 'final-form';
import type { FieldInputProps } from 'react-final-form';
import { useField } from 'react-final-form';

import type { InputMetaInterface } from '../../interfaces';

interface UseArrayFieldMetaProps<FieldValue> {
  index: number;
  fieldName: string;
  validate: FieldValidator<FieldValue> | undefined;
}

export const useArrayFieldMeta = <FieldValue = string>({
  fieldName,
  validate,
}: UseArrayFieldMetaProps<FieldValue>): {
  input: FieldInputProps<FieldValue, HTMLElement | HTMLSelectElement>;
} & InputMetaInterface => {
  const { input, meta } = useField<FieldValue>(fieldName, { validate });

  const { error, pristine, submitError, touched, valid } = meta;

  const hasError = !!(touched && !valid);
  const isValid = !!(touched && valid && !pristine);
  const errorMessage = hasError ? error || submitError : undefined;

  const inputClassname = classnames('fr-input', {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'fr-input--error': hasError,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'fr-input--valid': isValid,
  });

  return {
    errorMessage,
    hasError,
    input,
    inputClassname,
    isValid,
  };
};
