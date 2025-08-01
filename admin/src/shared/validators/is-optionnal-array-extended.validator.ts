import { ValidateIf, ValidationOptions } from 'class-validator';

export function IsOptionalArrayExtended(validationOptions?: ValidationOptions) {
  return ValidateIf((object, values) => {
    return !(values.length === 1 && values[0] === '');
  }, validationOptions);
}
