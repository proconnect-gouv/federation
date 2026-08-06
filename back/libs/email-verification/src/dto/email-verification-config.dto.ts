import { IsBoolean, IsNumber, IsPositive } from "class-validator";

export class EmailVerificationConfig {
  @IsBoolean()
  readonly isOtpEmailEnabled: boolean;

  @IsNumber()
  @IsPositive()
  readonly tokenExpirationDurationInMs: number;

  @IsNumber()
  @IsPositive()
  readonly verificationEmailCooldownBeforeResendInMs: number;
}
