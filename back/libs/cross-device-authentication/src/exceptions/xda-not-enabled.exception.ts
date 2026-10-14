import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { XdaBaseException } from "./xda-base.exception";

export class XdaNotEnabled extends XdaBaseException {
  public code = ErrorCode.XDA_NOT_ENABLED;
  public http_status_code = HttpStatus.FORBIDDEN;

  public error = "access_denied";
  public error_description =
    "cross device authentication is not enabled for this service provider";

  public title = "Connexion Cross-Device indisponible";

  constructor(public spName: string) {
    super();
    this.description = `La connexion Cross-Device n’est pas disponible pour le Fournisseur de Service "${this.spName}".`;
  }
}
