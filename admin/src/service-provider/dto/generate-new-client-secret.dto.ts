import { IsString } from 'class-validator';

export class GenerateNewClientSecretDTO {
  @IsString()
  readonly name: string;

  @IsString()
  readonly key: string;

  @IsString()
  // Legacy needed
  // tslint:disable-next-line: variable-name
  readonly client_secret: string;
}
