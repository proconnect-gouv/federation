import validatorjs from 'validator';

import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

import { ArrayAsyncHelper } from '@fc/common/helpers/array-async.helper';
import { LoggerService } from '@fc/logger';

import { FormDtoBase } from '../dto';
import {
  Dto2FormInvalidFormException,
  Dto2FormValidateIfRuleNotFoundException,
  Dto2FormValidationErrorException,
} from '../exceptions';
import {
  FieldErrorsInterface,
  FieldValidateIfRule,
  FieldValidator,
  MetadataDtoInterface,
} from '../interfaces';
import { ValidateIfRulesService, ValidatorCustomService } from '../services';
import { FORM_METADATA_TOKEN } from '../tokens';

@Injectable()
export class FormValidationPipe implements PipeTransform {
  constructor(
    private readonly logger: LoggerService,
    private readonly validatorCustom: ValidatorCustomService,
    private readonly validateIfRules: ValidateIfRulesService,
  ) {}

  // eslint-disable-next-line complexity
  async transform(
    target: Record<string, unknown>,
    { type, metatype, data }: ArgumentMetadata,
  ): Promise<Record<string, unknown>> {
    const validType = type === 'body' || type === 'query';
    const isSubObject = Boolean(data);
    if (!validType || isSubObject) {
      return target;
    }

    if (!(metatype.prototype instanceof FormDtoBase)) {
      throw new Dto2FormInvalidFormException();
    }

    const metadata: MetadataDtoInterface[] = Reflect.getMetadata(
      FORM_METADATA_TOKEN,
      metatype,
    );

    const validatedFields = await this.validate(target, metadata);

    const missingFields = this.validateRequiredField(target, metadata);

    const fieldValidationResults = [...validatedFields, ...missingFields];

    const hasErrors = this.hasValidatorsErrors(fieldValidationResults);

    if (hasErrors) {
      throw new Dto2FormValidationErrorException(fieldValidationResults);
    }

    return target;
  }

  private async validate(
    target: Record<string, unknown>,
    metadata: MetadataDtoInterface[],
  ): Promise<FieldErrorsInterface[]> {
    return await ArrayAsyncHelper.mapAsync(
      this.getAttributeKeys(target),
      this.validateField.bind(this, target, metadata),
    );
  }

  private async validateField(
    target: Record<string, unknown>,
    metadata: MetadataDtoInterface[],
    name: string,
  ): Promise<FieldErrorsInterface> {
    const fieldMetadata = metadata.find((field) => field.name === name);

    const fieldErrors: FieldErrorsInterface = {
      name,
      validators: [],
    };
    if (!fieldMetadata) {
      fieldErrors.validators.push({
        name,
        errorLabel: `${name}_invalidKey_error`,
        validationArgs: [],
      });
      return fieldErrors;
    }

    const shouldValidate = await this.shouldValidate(
      target[name],
      target,
      fieldMetadata.validateIf,
    );

    if (!shouldValidate) {
      return fieldErrors;
    }

    fieldErrors.validators = await ArrayAsyncHelper.reduceAsync<
      FieldValidator,
      FieldErrorsInterface['validators']
    >(
      fieldMetadata.validators,
      async (errors, validator) => {
        const valid = await this.callValidator(validator, target[name], target);

        if (!valid) {
          errors.push({
            name: validator.name,
            errorLabel: validator.errorLabel,
            validationArgs: validator.validationArgs,
          });
        }

        return errors;
      },
      [],
    );

    return fieldErrors;
  }

  private async shouldValidate(
    value: unknown,
    target: Record<string, unknown>,
    validateIf: FieldValidateIfRule[],
  ): Promise<boolean> {
    if (!Array.isArray(validateIf)) {
      return true;
    }

    return await ArrayAsyncHelper.everyAsync(
      validateIf,
      async (rule) => await this.callValidateIfRule(rule, value, target),
    );
  }

  private async callValidateIfRule(
    validateIfRule: FieldValidateIfRule,
    value: unknown,
    target: Record<string, unknown>,
  ): Promise<boolean | never> {
    const context = {
      target,
    };
    if (!this.validateIfRules[validateIfRule.name]) {
      this.logger.crit(
        `Conditional validation rule not found: ${validateIfRule.name}`,
      );
      throw new Dto2FormValidateIfRuleNotFoundException();
    }

    const ruleArgs = validateIfRule.ruleArgs || [];

    return await this.validateIfRules[validateIfRule.name].call(
      this.validateIfRules,
      value,
      ...ruleArgs,
      context,
    );
  }

  private async callValidator(
    validator: FieldValidator,
    value: unknown,
    target: Record<string, unknown>,
  ): Promise<boolean> {
    const validationFunction = validatorjs[validator.name]
      ? validatorjs
      : this.validatorCustom;

    const validationArgs = [...validator.validationArgs];

    if (validationFunction === this.validatorCustom) {
      const context = {
        target,
      };

      validationArgs.push(context);
    }

    return await validationFunction[validator.name]?.call(
      validationFunction,
      value,
      ...validationArgs,
    );
  }

  private getAttributeKeys(target: Record<string, unknown>): string[] {
    return Object.keys(target).filter(
      (key) => typeof target[key] !== 'function',
    );
  }

  private hasValidatorsErrors(target: FieldErrorsInterface[]): boolean {
    return target.some(({ validators }) => validators.length > 0);
  }

  private validateRequiredField(
    target: Record<string, unknown>,
    metadata: MetadataDtoInterface[],
  ): FieldErrorsInterface[] {
    const missingRequireKeys = metadata
      .filter((item) => item.required)
      .map((item) => item.name)
      .filter((key) => !(key in target))
      .map((key) => ({
        name: key,
        validators: [
          {
            name: 'isFilled',
            errorLabel: `isFilled_error`,
            validationArgs: [],
          },
        ],
      }));

    return missingRequireKeys;
  }
}
