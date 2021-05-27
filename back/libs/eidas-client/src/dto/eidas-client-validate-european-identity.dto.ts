/* istanbul ignore file */

// Declarative code
import { EidasCountries } from '@fc/eidas-country';
import { IsEnum } from 'class-validator';

export class EidasClientValidateEuropeanIdentity {
  @IsEnum(EidasCountries)
  readonly country: EidasCountries;
}
