import { EidasBridgeCountries } from '../enum';
import { IsEnum } from 'class-validator';

export class ValidateEuropeanIdentity {
  @IsEnum(EidasBridgeCountries)
  readonly country: string;
}
