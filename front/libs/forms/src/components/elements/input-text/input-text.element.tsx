import React from 'react';
import type { FieldInputProps } from 'react-final-form';

import type { PropsWithClassName } from '@fc/common';

interface InputTextElementProps<FieldValue = string> extends PropsWithClassName {
  disabled?: boolean;
  id: string;
  input: FieldInputProps<FieldValue, HTMLElement | HTMLSelectElement>;
}

export const InputTextElement = React.memo(
  ({ className, disabled = false, id, input }: InputTextElementProps) => (
    <input
      {...input}
      aria-describedby={`${input.name}-messages`}
      className={className}
      data-testid={`${id}--testid`}
      disabled={disabled}
      id={id}
      name={input.name}
      type={input.type}
    />
  ),
);

InputTextElement.displayName = 'InputTextElement';
