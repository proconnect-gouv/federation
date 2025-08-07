import { IsObject, IsString } from 'class-validator';

export class FormValidationErrorDto {
  @IsString()
  property: string;

  @IsObject()
  constraints: Record<string, string>;
}
