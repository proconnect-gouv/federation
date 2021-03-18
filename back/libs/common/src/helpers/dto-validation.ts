import 'reflect-metadata';
import { ClassTransformOptions, plainToClass } from 'class-transformer';
import { validate, ValidatorOptions, ValidationError } from 'class-validator';

export function getTransformed<T = any>(
  plain: object,
  dto: any,
  options?: ClassTransformOptions,
): T {
  return plainToClass(dto, plain, options);
}

export async function validateDto(
  plain: object,
  dto: any,
  validatorOptions: ValidatorOptions,
  transformOptions?: ClassTransformOptions,
): Promise<ValidationError[]> {
  const object = getTransformed<typeof dto>(plain, dto, transformOptions);

  return validate(object, validatorOptions);
}

/**
 * Extract the failed constraints from the current DTO validation error
 * @param error The current validation error to format
 * @param prefix The property path like <property1>.<...>.<propertyN>
 *
 * @returns The new messages array
 */
function formatErrorMessages(error: ValidationError, prefix: string) {
  const constraints = Object.keys(error.constraints);

  return constraints.map((constraint) => {
    return `${prefix}${error.property}: ${constraint}`;
  });
}

/**
 * Recursively extract all failed constraints from the DTO validation result
 * @param validationErrors The current DTO errors to format
 * @param prefix The property path like <property1>.<...>.<propertyN>
 *
 * @returns The messages in an array
 */
function getAllPropertiesErrors(
  validationErrors: ValidationError[],
  prefix = '',
): string[] {
  let messages = [];

  for (const error of validationErrors) {
    if (error.constraints) {
      messages = messages.concat(formatErrorMessages(error, prefix));
    }
    /**
     * Required default value on children because validationError.toString required it
     */
    if (!error.children) {
      error.children = [];
    }

    messages = messages.concat(
      getAllPropertiesErrors(error.children, `${prefix}${error.property}.`),
    );
  }

  return messages;
}

/**
 * Format and return an error containing all failed constraints for each property
 * @param validationErrors DTO validation result
 *
 * @returns An error containing the failed constraints for each property
 */
export function getDtoErrors(
  validationErrors: ValidationError[],
): Error | null {
  const errors = getAllPropertiesErrors(validationErrors);

  if (errors.length === 0) {
    return null;
  }

  return new Error(errors.join('\n'));
}
