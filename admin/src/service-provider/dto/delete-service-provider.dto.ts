import { Transform } from "class-transformer";
import { IsString } from "class-validator";
import { linesToArray } from "../../utils/transforms/string.transform";

export class DeleteServiceProviderDto {
  @Transform(linesToArray)
  @IsString({ each: true })
  readonly deleteItems: string[];

  @IsString()
  readonly name: string;
}
