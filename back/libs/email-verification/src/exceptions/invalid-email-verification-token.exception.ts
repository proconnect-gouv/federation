import { ErrorCode } from "../enums";
import { EmailVerificationBaseException } from "./email-verification-base.exception";

export class InvalidEmailVerificationTokenException extends EmailVerificationBaseException {
  public code = ErrorCode.INVALID_EMAIL_VERIFICATION_TOKEN;

  public userMessage = "Le code rentré est invalide ou expiré.";
}
