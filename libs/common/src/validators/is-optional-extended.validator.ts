import { ValidateIf, ValidationOptions } from 'class-validator';

export function isOptionalExtended(value) {
  return value !== null && value !== undefined && value !== '';
}

export function IsOptionalExtended(validationOptions?: ValidationOptions) {
  return ValidateIf(
    /* istanbul ignore next */ (obj, value) => {
      return isOptionalExtended(value);
    },
    validationOptions,
  );
}
