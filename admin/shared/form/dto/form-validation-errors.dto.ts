import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FormValidationErrorDto } from './form-validation-error.dto';

export class FormValidationErrorsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormValidationErrorDto)
  message: FormValidationErrorDto[];
}
