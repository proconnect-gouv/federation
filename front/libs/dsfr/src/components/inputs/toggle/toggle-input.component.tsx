import React from 'react';
import type { FieldInputProps } from 'react-final-form';

interface ToggleInputComponentProps {
  disabled?: boolean;
  onUpdate?: (v: boolean) => void;
  // @NOTE la regle est desactivée car le type provient de la librairie react-final-form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: FieldInputProps<any, HTMLElement>;
}

export const ToggleInputComponent = React.memo(
  ({ disabled = false, input, onUpdate = undefined }: ToggleInputComponentProps) => (
    <input
      {...input}
      aria-describedby={`${input.name}-hint-text`}
      className="fr-toggle__input"
      data-testid={`field-toggle-input-${input.name}`}
      disabled={disabled}
      id={input.name}
      type="checkbox"
      onChange={(e) => {
        input.onChange(e);
        if (onUpdate) {
          onUpdate(e.target.checked);
        }
      }}
    />
  ),
);

ToggleInputComponent.displayName = 'ToggleInputComponent';
