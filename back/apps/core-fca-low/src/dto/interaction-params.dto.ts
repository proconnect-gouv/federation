import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class InteractionParamsDto {
  @IsEnum(['invalid_email'])
  @IsOptional()
  readonly error?: 'invalid_email';

  @IsString()
  @IsEmail()
  @IsOptional()
  readonly email_suggestion?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  readonly user_email?: string;
}
