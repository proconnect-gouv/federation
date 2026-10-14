import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { FederationBaseException } from "./federation-base.exception";

export class XdaRequestNotFound extends FederationBaseException {
  public code = ErrorCode.XDA_REQUEST_NOT_FOUND;
  public http_status_code = HttpStatus.NOT_FOUND;

  public error = "invalid_request";
  public error_description = "cross device authentication request not found";

  public illustration = "access-restricted-error";
  public title = "Demande Cross-Device introuvable";
  public description =
    "Cette demande de connexion Cross-Device n’existe pas, a déjà été examinée ou ne vous est pas destinée.";
  public displayContact = false;
}
