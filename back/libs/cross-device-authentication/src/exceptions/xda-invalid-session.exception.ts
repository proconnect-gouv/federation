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
  public description = `Pour consulter vos demandes de connexion Cross-Device :
1. Dans un nouvel onglet, allez sur <a href="https://proconnect.gouv.fr/xda" target="_blank" rel="noopener">https://proconnect.gouv.fr/xda</a>.
2. Si vous n’avez pas de session en cours sur https://proconnect.gouv.fr, vous serez guidé vers l’écran de connexion, puis redirigé vers la page de vos demandes de connexion Cross-Device.`;
}
