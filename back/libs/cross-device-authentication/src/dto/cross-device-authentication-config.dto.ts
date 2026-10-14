import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsPositive,
  IsString,
} from "class-validator";

export class CrossDeviceAuthenticationConfig {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @ArrayMinSize(32)
  @ArrayMaxSize(32)
  @IsString({ each: true })
  readonly emojiAlphabet: string[];

  @IsInt()
  @IsPositive()
  readonly emojiCodeLength: number;

  @IsInt()
  @IsPositive()
  readonly requestExpirationDurationInMs: number;
}
