import {
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function arrayInclude(array: string[], allowed: string[]) {
  return allowed.some((elem) => array.includes(elem));
}

export class ArrayIncludesConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    const [allowed] = args.constraints;

    return value instanceof Array && arrayInclude(value, allowed);
  }

  defaultMessage(args: ValidationArguments) {
    const [allowed] = args.constraints;

    return `${args.property} allows only theses values: "${allowed.join(
      ', ',
    )}", got: "${args.value.join(', ')}"`;
  }
}

// declarative code
/* istanbul ignore next */
export function ArrayIncludes(
  allowed: string[],
  validationOptions?: ValidationOptions,
) {
  // declarative code
  /* istanbul ignore next */
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [allowed],
      validator: ArrayIncludesConstraint,
    });
  };
}
