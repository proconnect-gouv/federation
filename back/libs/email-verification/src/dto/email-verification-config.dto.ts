import { IsNumber, IsPositive, Max, Min } from "class-validator";

export class EmailVerificationConfig {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(100)
  readonly eligibleEmailsPercentage: number;

  @IsNumber()
  @IsPositive()
  readonly tokenExpirationDurationInMs: number;

  @IsNumber()
  @IsPositive()
  readonly verificationEmailCooldownBeforeResendInMs: number;
}
