import React from 'react';

import { ConfigService } from '@fc/config';
import { Sizes } from '@fc/dsfr';
import { ArrayField } from '@fc/forms';

import { FieldsCommponentMap, Options } from '../../enums';
import { useFieldValidate } from '../../hooks';
import type { DTO2FormConfig } from '../../interfaces';
import type { JSONFieldType } from '../../types';

interface DTO2FieldComponentProps {
  field: JSONFieldType;
}

export const DTO2FieldComponent = React.memo(({ field }: DTO2FieldComponentProps) => {
  const { validateOnFieldChange } = ConfigService.get<DTO2FormConfig>(Options.CONFIG_NAME);

  const {
    array,
    disabled,
    hint,
    label,
    maxChars,
    name,
    options,
    required,
    type,
    validators,
    value,
  } = field;

  const validate = useFieldValidate({
    disabled,
    required,
    validators,
  });

  const config = {
    clipboardDisabled: false,
    hint,
    inline: true,
    label,
    maxChars,
    name,
    required,
    size: Sizes.MEDIUM,
    value,
  };

  const choices = options || [];
  const validateFunc = validateOnFieldChange ? validate : undefined;

  const Component = array ? ArrayField : FieldsCommponentMap[type];

  return <Component choices={choices} config={config} type={type} validate={validateFunc} />;
});

DTO2FieldComponent.displayName = 'DTO2FieldComponent';
