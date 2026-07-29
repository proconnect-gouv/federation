import { ErrorCode } from "../enums";
import { EmailVerificationBaseException } from "./email-verification-base.exception";

export class SendEmailFailureException extends EmailVerificationBaseException {
  public code = ErrorCode.SEND_EMAIL_FAILURE;

  public userMessage =
    "Une erreur est survenue lors de l'envoi de l'e-mail de vérification. Veuillez réessayer plus tard.";
}
