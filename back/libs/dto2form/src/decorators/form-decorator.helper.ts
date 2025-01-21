import { getMetadataStorage } from 'class-validator';

import { convertRegExpToStrings } from '../helpers';
import {
  FieldAttributes,
  FieldAttributesArguments,
  FieldValidator,
  FieldValidatorBase,
} from '../interfaces';

export class FormDecoratorHelper {
  static checkCompatibility(constructor) {
    const metadata =
      getMetadataStorage()['validationMetadatas'].get(constructor);

    if (metadata) {
      throw new Error(
        `Please remove class validator decorators from "${constructor}" to use as form. See dto2form library documentation for more information.`,
      );
    }
  }

  static generateFieldValidatorsMissingAttributes(
    validators: FieldValidatorBase[],
  ): [FieldValidator, ...FieldValidator[]] {
    return validators.map((validator: FieldValidatorBase) => {
      const finalValidator = validator as FieldValidator;

      finalValidator.errorLabel = `${validator.name}_error`;
      finalValidator.validationArgs = convertRegExpToStrings(
        validator.validationArgs,
      );

      return validator;
    }) as [FieldValidator, ...FieldValidator[]];
  }

  static generateFieldMissingAttributes<T extends FieldAttributes>(
    key: string,
    attributes: FieldAttributesArguments,
    defaultOrder: number,
    defaultType: string,
  ): T {
    const validators =
      FormDecoratorHelper.generateFieldValidatorsMissingAttributes(
        attributes.validators,
      );

    const result = Object.assign({}, attributes, {
      type: attributes.type || defaultType,
      name: key,
      required: Boolean(attributes.required),
      order: attributes.order || defaultOrder,
      validateIf: attributes.validateIf || [],
      validators,
    }) as T;

    return result;
  }

  static handleRequiredField<T extends FieldAttributes>(attributes: T): T {
    if (attributes.required) {
      const requiredFieldValidator = {
        name: 'isFilled',
        errorLabel: `isFilled_error`,
        validationArgs: [],
      };
      attributes.validators.unshift(requiredFieldValidator);
    }

    return attributes;
  }
}
