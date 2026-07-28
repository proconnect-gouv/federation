import { Transform } from "class-transformer";
import { IsAscii, IsString, Matches } from "class-validator";
const VERIFY_EMAIL_TOKEN_REGEX = /^\d{10}$/;
export class VerifyEmailDto {
  @IsString()
  @Transform(({ value }) =>
    typeof value === "string" ? value.replace(/\s/g, "") : value,
  )
  @Matches(VERIFY_EMAIL_TOKEN_REGEX)
  readonly verify_email_token: string;

  @IsString()
  @IsAscii()
  readonly csrfToken: string;
}
