/* istanbul ignore file */

// Declarative code
import { EidasCountries } from '@fc/eidas';
import { IsEnum } from 'class-validator';

export class ValidateEuropeanIdentity {
  @IsEnum(EidasCountries)
  readonly country: EidasCountries;
}
