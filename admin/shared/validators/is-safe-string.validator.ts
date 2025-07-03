import { Matches, ValidationOptions } from 'class-validator';

export function IsSafeString(validationOptions?: ValidationOptions) {
  return Matches(/^[A-Za-z0-9-\sàâéêèëîïôùç\'\.,!]+$/, validationOptions);
}
