import {
  IsString,
  ValidateNested,
  MinLength,
  IsEnum,
  IsBoolean,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Genders, RnippResponseCodes } from '../enums';
import { Type } from 'class-transformer';
import { IsRnippBirthdate, IsCog } from '../validators';

const COG_FRANCE = '99100';

export class RnippPivotIdentity {
  @IsString()
  @IsEnum(Genders)
  readonly gender: string;

  @IsString()
  @MinLength(1)
  // oidc defined variable name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly family_name: string;

  @IsString()
  @MinLength(1)
  // oidc defined variable name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  readonly given_name: string;

  @IsString()
  @IsRnippBirthdate()
  readonly birthdate: string;

  @ValidateIf(RnippPivotIdentity.shouldValidateBirthplace)
  @IsString()
  @IsCog()
  readonly birthplace: string;

  @IsString()
  @IsCog()
  readonly birthcountry: string;

  static shouldValidateBirthplace(instance: RnippPivotIdentity) {
    return instance.birthcountry === COG_FRANCE;
  }
}

export class CitizenStatus {
  @IsOptional()
  @ValidateNested()
  @Type(/* istanbul ignore next */ () => RnippPivotIdentity)
  identity?: RnippPivotIdentity;

  @IsOptional()
  @IsBoolean()
  deceased?: boolean;

  @IsEnum(RnippResponseCodes)
  rnippCode: RnippResponseCodes;
}
