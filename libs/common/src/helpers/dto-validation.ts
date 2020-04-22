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

/**
 * Extract the failed constraints from the current DTO validation error
 * @param error The current validation error to format
 * @param prefix The property path like <property1>.<...>.<propertyN>
 *
 * @returns The new messages array
 */
function formatErrorMessages(error: ValidationError, prefix: string) {
  const constraints = Object.keys(error.constraints);

  return constraints.map(constraint => {
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

    if (error.children) {
      messages = messages.concat(
        getAllPropertiesErrors(error.children, `${prefix}${error.property}.`),
      );
    }
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
