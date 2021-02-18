import {
  ValidateBy,
  ValidationOptions,
  arrayContains,
  isObject,
} from 'class-validator';
import { FeatureHandler } from '../decorators';
import { IFeatureHandlerDatabaseMap } from '../interfaces';

export class IsRegisteredFeatureHandlerConstraint {
  validate(value: IFeatureHandlerDatabaseMap): boolean {
    if (!isObject(value)) {
      return false;
    }
    const handlerNames = Object.values(value);
    const registredHandlers = FeatureHandler.getAll();
    return arrayContains(registredHandlers, handlerNames);
  }
}

/* istanbul ignore next */
export function IsRegisteredHandler(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsRegisteredFeatureHandler',
      validator: IsRegisteredFeatureHandlerConstraint.prototype,
    },
    validationOptions,
  );
}
