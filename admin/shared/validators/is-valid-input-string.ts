import { ValidateIf, ValidationOptions } from 'class-validator';

/**
 * Regexp to allow most legit alphanum characters
 * @see https://stackoverflow.com/a/26900132/1071169
 * @see https://unicode-table.com/en/
 * \u0026 => &
 * \u002f => /
 */
export const VALID_INPUT_STRING_REGEX = /^[A-Za-zÀ-žØ-öø-ÿ0-9\s,.:!\(\)_'\-\u0026-\u002f]+$/;

export function IsValidInputString(validationOptions?: ValidationOptions) {
  return ValidateIf((obj, value) => {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    return VALID_INPUT_STRING_REGEX.test(value);
  }, validationOptions);
}
