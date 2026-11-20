import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { XdaBaseException } from "./xda-base.exception";

export class XdaReviewerSessionInvalid extends XdaBaseException {
  public code = ErrorCode.XDA_REVIEWER_SESSION_INVALID;
  public http_status_code = HttpStatus.FORBIDDEN;

  public error = "access_denied";
  public error_description =
    "the session that approved the cross device authentication request cannot be shared";

  public title = "Session de l’ordinateur RIE indisponible";
  public description =
    "La session ProConnect qui a validé cette demande sur votre ordinateur RIE n’est plus active ou ne correspond pas à votre connexion. Recommencez la vérification de connexion en initiant une connexion depuis le service.";
}
