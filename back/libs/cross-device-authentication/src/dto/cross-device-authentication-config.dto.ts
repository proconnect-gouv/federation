import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";

export class Emoji {
  @IsString()
  @IsNotEmpty()
  readonly symbol: string;

  // in French, displayed below the symbol
  @IsString()
  @IsNotEmpty()
  readonly label: string;
}

export class CrossDeviceAuthenticationConfig {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique(({ symbol }: Emoji) => symbol)
  @ArrayMinSize(32)
  @ArrayMaxSize(32)
  @ValidateNested({ each: true })
  @Type(() => Emoji)
  readonly emojiAlphabet: Emoji[];

  @IsInt()
  @IsPositive()
  readonly emojiCodeLength: number;

  @IsInt()
  @IsPositive()
  readonly requestExpirationDurationInMs: number;

  @IsInt()
  @IsPositive()
  readonly maxDelayBetweenRequestCreationAndVerificationStartInMs: number;
}
