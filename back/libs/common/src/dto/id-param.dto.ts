import { IsUUID } from 'class-validator';

export class IdParamDto {
  @IsUUID(4)
  readonly id: string;
}
