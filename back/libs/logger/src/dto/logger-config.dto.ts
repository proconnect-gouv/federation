import { IsEnum } from 'class-validator';

import { LogLevels } from '../enums';

export class LoggerConfig {
  @IsEnum(LogLevels)
  readonly threshold: LogLevels;
}
