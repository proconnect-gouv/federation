import { EidasBridgeCountries } from '../enums';
import { IsEnum } from 'class-validator';

export class ValidateEuropeanIdentity {
  @IsEnum(EidasBridgeCountries)
  readonly country: string;
}
