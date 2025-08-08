import { Transform } from 'class-transformer';
import { linesToArray } from '../../utils/transforms/string.transform';
import { IsString } from 'class-validator';

export class DeleteServiceProviderDto {
  @Transform(linesToArray)
  @IsString({ each: true })
  readonly deleteItems: string[];

  @IsString()
  readonly name: string;
}
