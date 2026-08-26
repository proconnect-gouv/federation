import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { CoreFcaBaseException } from "./core-fca-base.exception";

export class CoreFcaApiSireneDownException extends CoreFcaBaseException {
  public code = ErrorCode.API_SIRENE_DOWN;
  public http_status_code = HttpStatus.SERVICE_UNAVAILABLE;

  public error = "temporarily_unavailable";
  public error_description =
    "authentication temporarily unavailable due to sirene api failure";

  public illustration = "default-error";
  public title =
    "Vérification de votre organisation temporairement indisponible";
  public description =
    "Nous n'avons pas pu vérifier le SIRET associé à votre organisation car le service utilisé pour cette vérification est actuellement indisponible. Cela ne signifie pas que votre accès est refusé : merci de réessayer dans quelques minutes.";

  public displayContact = false;
}
