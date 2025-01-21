import validator from 'validator';

import { isString } from '@fc/common';

import { isFilled } from '../validators';

export const Validators = {
  ...validator,
  isFilled,
  isString,
};
