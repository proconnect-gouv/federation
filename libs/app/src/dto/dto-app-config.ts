import { IsString } from 'class-validator';

export class AppConfig {
  @IsString()
  readonly name: string;

  /**
   * @todo regex to check Path and length of String
   */
  @IsString()
  readonly urlPrefix: string;
}
