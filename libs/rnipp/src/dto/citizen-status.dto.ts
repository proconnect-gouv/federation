import {
  IsString,
  ValidateNested,
  MinLength,
  IsEnum,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { IsOptionalExtended } from '@fc/common';
import { Genders, RnippResponseCodes } from '../enums';
import { Type } from 'class-transformer';
import { IsRnippBirthdate, IsCog } from '../validators';

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

  @IsOptionalExtended()
  @IsString()
  @IsCog()
  readonly birthplace: string;

  @IsString()
  @IsCog()
  readonly birthcountry: string;
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
