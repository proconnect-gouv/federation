import { IsString, IsNumber } from 'class-validator';

export class RnippConfig {
  @IsString()
  readonly hostname: string;

  @IsString()
  readonly baseUrl: string;

  @IsNumber()
  readonly timeout: number;
}
