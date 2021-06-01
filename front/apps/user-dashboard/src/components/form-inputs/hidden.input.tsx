import React from 'react';
import { Field } from 'react-final-form';

type HiddenInputType = {
  name: string;
};

function HiddenInputComponent({ name }: HiddenInputType): JSX.Element {
  return <Field component="input" name={name} type="hidden" />;
}

export default HiddenInputComponent;
