import 'reflect-metadata';
import { plainToClass } from 'class-transformer';
import { validate, ValidatorOptions, ValidationError } from 'class-validator';

export function getTransformed<T>(plain: object, dto: any): T {
  return plainToClass(dto, plain);
}

export async function validateDto(
  plain: object,
  dto: any,
  options: ValidatorOptions,
): Promise<ValidationError[]> {
  const object = getTransformed(plain, dto);

  return validate(object, options);
}
