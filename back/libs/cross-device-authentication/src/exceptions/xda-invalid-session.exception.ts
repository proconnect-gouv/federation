import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { XdaBaseException } from "./xda-base.exception";

export class XdaInvalidSession extends XdaBaseException {
  public code = ErrorCode.XDA_INVALID_SESSION;
  public http_status_code = HttpStatus.UNAUTHORIZED;

  public error = "login_required";
  public error_description =
    "an active session is required to review cross device authentication requests";

  public title = "Session ProConnect introuvable";
  public description = `Pour consulter vos demandes de connexion par un appareil vérifié, connectez-vous en cliquant sur le lien suivant : <a href="https://proconnect.gouv.fr/xda" rel="noopener">https://proconnect.gouv.fr/xda</a>.`;
}
