import { IsEnum, IsBoolean, IsString, IsNotEmpty } from 'class-validator';
import { LogLevelNames } from '../enum';
import { Type } from 'class-transformer';

export class LoggerConfig {
  @IsEnum(LogLevelNames)
  readonly level: LogLevelNames;

  @IsBoolean()
  readonly isDevelopment: boolean;

  @IsString()
  @IsNotEmpty()
  readonly path: string;
}
