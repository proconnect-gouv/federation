import { IsString } from 'class-validator';

export class GetAuthorizeParamsDTO {
  @IsString()
  readonly client_id: string;
}