import { Expose } from 'class-transformer';
import { IsAscii, MinLength } from 'class-validator';

export class MinIdentityDto {
  @MinLength(1)
  @IsAscii()
  @Expose()
  readonly sub!: string;
}
