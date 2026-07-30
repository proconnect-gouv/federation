import { BaseException } from "@fc/exceptions/exceptions";

export abstract class EmailVerificationBaseException extends BaseException {
  public scope = 17;

  public userMessage = "Une erreur est survenue. Veuillez réessayer plus tard.";
}
