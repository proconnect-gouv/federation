import { ClassTransformOptions, plainToInstance } from "class-transformer";
import { validate, ValidationError, ValidatorOptions } from "class-validator";

declare type ClassConstructor<T> = {
  // Type any used in class-validator.validate

  new (...args: any[]): T;
};

// Type any used in class-validator.validate

export function getTransformed<T = any>(
  plain: object,
  dto: ClassConstructor<T>,
  options?: ClassTransformOptions,
): T {
  return plainToInstance(dto, plain, options);
}

export async function validateDto(
  plain: object,
  // Type any used in class-validator.validate

  dto: ClassConstructor<any>,
  validatorOptions: ValidatorOptions,
  transformOptions?: ClassTransformOptions,
): Promise<ValidationError[]> {
  const object = getTransformed<typeof dto>(plain, dto, transformOptions);
  return await validate(object, validatorOptions);
}
