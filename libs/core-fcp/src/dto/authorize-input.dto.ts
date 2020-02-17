import { IsString } from 'class-validator';

export class AuthorizeInputDTO {
  @IsString()
  readonly client_id: string
}