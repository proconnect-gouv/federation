import { ErrorCode } from "../enums";
import { EmailVerificationBaseException } from "./email-verification-base.exception";

export class TooManyAttemptsException extends EmailVerificationBaseException {
  public code = ErrorCode.TOO_MANY_ATTEMPTS;

  public userMessage =
    "Vous avez dépassé le nombre de tentatives autorisées. Veuillez réessayer plus tard.";
}
