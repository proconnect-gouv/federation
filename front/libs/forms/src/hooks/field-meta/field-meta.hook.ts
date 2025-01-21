import classnames from 'classnames';
import type { FieldMetaState } from 'react-final-form';

import type { InputMetaInterface } from '../../interfaces';

export const useFieldMeta = <FieldValue = string>(
  meta: FieldMetaState<FieldValue>,
): InputMetaInterface => {
  const { error, invalid, pristine, submitError, touched, valid } = meta;

  const hasError = !!(touched && invalid);
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
    inputClassname,
    isValid,
  };
};
