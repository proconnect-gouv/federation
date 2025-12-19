import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class InteractionErrorQuery {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  @Transform(({ value }) => value || undefined)
  error: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  @Transform(({ value }) => value || undefined)
  error_description: string;
}
