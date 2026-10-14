import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { XdaBaseException } from "./xda-base.exception";

export class XdaRequestNotFound extends XdaBaseException {
  public code = ErrorCode.XDA_REQUEST_NOT_FOUND;
  public http_status_code = HttpStatus.NOT_FOUND;

  public error = "invalid_request";
  public error_description = "cross device authentication request not found";

  public title = "Demande Cross-Device introuvable";
  public description =
    "Cette demande de connexion Cross-Device n’existe pas, a expiré, a déjà été traitée ou ne vous est pas destinée.";
}
