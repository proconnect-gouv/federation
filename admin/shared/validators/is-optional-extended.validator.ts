import { ValidateIf, ValidationOptions } from 'class-validator';

export function IsOptionalExtended(validationOptions?: ValidationOptions) {
  return ValidateIf((_obj, value) => {
    return value !== null && value !== undefined && value !== '';
  }, validationOptions);
}
