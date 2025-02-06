import type { FieldValidator } from 'final-form';
import React from 'react';
import { Field } from 'react-final-form';

import type { FieldTypes } from '../../../enums';
import type {
  ChoiceInterface,
  InputAttributesInterface,
  InputConfigInterface,
} from '../../../interfaces';
import { SelectInput } from '../../inputs';

interface SelectFieldProps {
  type: FieldTypes;
  choices: ChoiceInterface[];
  validate?: FieldValidator<string> | undefined;
  config: InputConfigInterface & InputAttributesInterface<string>;
}

export const SelectField = React.memo(({ choices, config, type, validate }: SelectFieldProps) => {
  const { format, name, ...rest } = config;

  return (
    <Field
      choices={choices}
      component={SelectInput}
      config={rest}
      format={format}
      name={name}
      subscription={{ error: true, touched: true, value: true }}
      type={type}
      validate={validate}
    />
  );
});

SelectField.displayName = 'SelectField';
