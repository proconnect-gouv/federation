import { IsNumber, IsPositive, Max, Min } from "class-validator";

export class EmailVerificationConfig {
  @IsNumber({ allowInfinity: false, allowNaN: false })
  @Min(0)
  @Max(100)
  readonly eligibleEmailsPercentage: number;

  @IsNumber()
  @IsPositive()
  readonly tokenExpirationDurationInMs = 60 * 60 * 1000; // 1 hour in milliseconds

  @IsNumber()
  @IsPositive()
  readonly verificationEmailWaitingDurationBeforeResendInMs = 10 * 60 * 1000; // 10 minutes in milliseconds
}
