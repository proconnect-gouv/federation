import { IsString } from 'class-validator';

export class SignPayloadDto {
  @IsString()
  readonly data: string;

  @IsString()
  readonly digest: string;
}
