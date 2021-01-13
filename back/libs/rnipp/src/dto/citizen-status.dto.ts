import { ValidateNested, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { RnippResponseCodes } from '../enums';
import { Type } from 'class-transformer';
import { RnippPivotIdentity } from './rnipp-pivot-identity.dto';
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
