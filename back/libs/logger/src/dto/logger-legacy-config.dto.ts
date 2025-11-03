import { IsOptional, IsString } from 'class-validator';

export class LoggerLegacyConfig {
  @IsOptional()
  @IsString()
  readonly path?: string;
}
