import { IsString } from 'class-validator';

export class AppRmqConfig {
  @IsString()
  readonly name: string;
}
