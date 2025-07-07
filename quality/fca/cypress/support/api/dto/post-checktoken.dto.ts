import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ValidTokenIntrospection {
  @IsBoolean()
  readonly active: boolean;

  @IsString()
  @MinLength(1)
  readonly sub: string;

  @IsString()
  @MinLength(1)
  readonly client_id: string;

  @IsNumber()
  @IsPositive()
  readonly exp: number;

  @IsNumber()
  @IsPositive()
  readonly iat: number;

  @IsString()
  @MinLength(1)
  readonly iss: string;

  @IsString()
  @MinLength(1)
  readonly scope: string;

  @IsString()
  @MinLength(1)
  readonly token_type: string;
}

class ExpiredTokenIntrospection {
  @IsBoolean()
  readonly active: boolean;
}

export class PostChecktokenValidTokenDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ValidTokenIntrospection)
  readonly token_introspection: ValidTokenIntrospection;

  @IsString()
  @MinLength(1)
  readonly aud: string;

  @IsNumber()
  @IsPositive()
  readonly iat: number;

  @IsString()
  @MinLength(1)
  readonly iss: string;
}

export class PostChecktokenExpiredTokenDto {
  @IsObject()
  @ValidateNested()
  @Type(() => ExpiredTokenIntrospection)
  readonly token_introspection: ExpiredTokenIntrospection;

  @IsString()
  @MinLength(1)
  readonly aud: string;

  @IsNumber()
  @IsPositive()
  readonly iat: number;

  @IsString()
  @MinLength(1)
  readonly iss: string;
}
