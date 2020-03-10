import { IsEnum, IsBoolean, IsString } from 'class-validator';
import { LogLevelNames } from '../enum';

export class LoggerConfig {
  @IsEnum(LogLevelNames)
  readonly level: LogLevelNames;

  @IsBoolean()
  readonly isDevelopment: boolean;

  @IsString()
  readonly path: string;
}
