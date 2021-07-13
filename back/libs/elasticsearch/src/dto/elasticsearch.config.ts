/* istanbul ignore file */
import { IsString, IsNumber } from 'class-validator';

export class ElasticsearchConfig {
  @IsString()
  readonly tracksIndex: string;

  @IsString()
  readonly protocol: string;

  @IsString()
  readonly host: string;

  @IsNumber()
  readonly port: number;
}
