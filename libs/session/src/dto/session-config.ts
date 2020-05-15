import { IsString, IsNumber, MinLength } from 'class-validator';

export class SessionConfig {
  @IsString()
  @MinLength(32)
  readonly secret: string;

  @IsString()
  readonly name: string;

  @IsNumber()
  readonly ttl: number;
}
