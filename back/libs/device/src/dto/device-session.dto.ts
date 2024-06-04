/* istanbul ignore file */

// Declarative file
import { Expose } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export class DeviceSession {
  @IsBoolean()
  @Expose()
  readonly isTrusted: boolean;

  @IsBoolean()
  @Expose()
  readonly isSuspicious: boolean;
}
