import { IsBase64, IsString } from 'class-validator';

export class CallbackDTO {
  @IsString()
  @IsBase64()
  readonly token: string;
}
