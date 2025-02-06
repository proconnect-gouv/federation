import React from 'react';

import { ComponentTypes } from '../../../enums';
import { useFieldMeta } from '../../../hooks';
import type { PropsWithInputConfigType } from '../../../types';
import { GroupElement, InputTextElement, LabelElement, MessageElement } from '../../elements';

export const TextInput = React.memo(({ config, input, meta }: PropsWithInputConfigType) => {
  const { hint, label, required } = config;
  const { className, disabled, name } = input;

  const { errorMessage, hasError, inputClassname, isValid } = useFieldMeta(meta);

  const id = `form-input-text-${name}`;
  return (
    <GroupElement
      className={className}
      disabled={disabled}
      hasError={hasError}
      isValid={isValid}
      type={ComponentTypes.INPUT}>
      <LabelElement hint={hint} label={label} name={name} required={required} />
      <InputTextElement className={inputClassname} disabled={disabled} id={id} input={input} />
      <MessageElement
        dataTestId={`${name}-messages`}
        error={errorMessage}
        id={name}
        isValid={isValid}
      />
    </GroupElement>
  );
});

TextInput.displayName = 'TextInput';
