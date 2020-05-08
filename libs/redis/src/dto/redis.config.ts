/* istanbul ignore file */

import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RedisConfig {
  @IsString()
  readonly host: string;

  @IsNumber()
  @Type(() => Number)
  readonly port: number;

  @IsNumber()
  @Type(() => Number)
  readonly db: number;

  /**
   * @TODO Configure password on docker-compose and make this mandatory
   */
  @IsString()
  @IsOptional()
  readonly password: string;
}
