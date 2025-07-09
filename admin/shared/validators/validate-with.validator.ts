import {
  ValidationOptions,
  ValidationArguments,
  registerDecorator,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { LoggerService } from '@fc/shared/logger/logger.service';

export const VALIDATE_WITH = 'ValidateWith';

export type Comparator = (instance: any, values: any) => boolean;

@ValidatorConstraint()
export class ValidateWithConstraint implements ValidatorConstraintInterface {
  public constructor(private readonly logger: LoggerService) {}

  validate(values: unknown, args: ValidationArguments): boolean {
    try {
      const [fn] = args.constraints as [Comparator];
      return fn && fn(args.object, values);
    } catch (e) {
      this.logger.error(e);
    }
    return false;
  }
}

// declarative code
/* istanbul ignore next */
export function ValidateWith(
  allowed: Comparator,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  // declarative code
  /* istanbul ignore next */
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: VALIDATE_WITH,
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [allowed],
      validator: ValidateWithConstraint,
    });
  };
}
