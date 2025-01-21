import { Injectable } from '@nestjs/common';

import {
  MetadataDtoInterface,
  MetadataDtoValidatorsInterface,
} from '@fc/dto2form';
import { I18nService, I18nVariables } from '@fc/i18n';

import { IsLengthI18nOptions } from '../interfaces';

@Injectable()
export class PartnersI18nService {
  constructor(private readonly i18nService: I18nService) {}

  public translation(payload: MetadataDtoInterface[]): MetadataDtoInterface[] {
    return payload.map((item) => {
      const label = this.getTranslation('label', item.name);
      const hintText = this.getTranslation('hintText', item.name);

      const validators = this.getValidatorsWithErrorLabels(
        item.validators,
        item.name,
      );

      return {
        ...item,
        label,
        hintText,
        validators,
      };
    });
  }

  private getTranslation(
    type: string,
    name: string,
    option?: I18nVariables,
  ): string {
    return this.i18nService.translate(`Form.${type}.${name}`, option);
  }

  private getValidatorsWithErrorLabels(
    validators: MetadataDtoValidatorsInterface[],
    name: string,
  ): MetadataDtoValidatorsInterface[] {
    const validatorsEnriched = validators.map((validator) => {
      let errorLabel: string;

      if (validator.name === 'isLength') {
        const { suffix, options } = this.generateI18nIsLengthParams(
          /* @Todo Revoir / challenger l'interface MetadataDtoValidatorsInterface
           * @see #2042
           */
          validator.validationArgs[0] as unknown as Record<string, unknown>,
        );

        errorLabel = this.getTranslation(
          `${validator.errorLabel}${suffix}`,
          name,
          {
            ...options,
          },
        );
      } else {
        errorLabel = this.getTranslation(validator.errorLabel, name);
      }

      return {
        ...validator,
        errorLabel,
      };
    });

    return validatorsEnriched;
  }

  private generateI18nIsLengthParams(
    validationArgs: Record<string, unknown>,
  ): IsLengthI18nOptions {
    const keys = [];
    const options = {};

    Object.entries(validationArgs)
      .filter(([key]) => ['max', 'min'].includes(key))
      .forEach(([key, value]) => {
        keys.push(`.${key}`);
        options[key] = value;
      });

    const keysJoin = keys.join('');

    return { suffix: keysJoin, options };
  }
}
