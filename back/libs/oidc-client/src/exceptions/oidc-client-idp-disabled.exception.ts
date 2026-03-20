import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { OidcClientBaseException } from "./oidc-client-base.exception";

export class OidcClientIdpDisabledException extends OidcClientBaseException {
  public code = ErrorCode.DISABLED_PROVIDER;
  public crispLink =
    "https://proconnect.crisp.help/fr/article/code-020017-fournisseur-didentite-indisponible-112nb91/";
  public description =
    "Un incident technique est en cours. Merci de revenir plus tard.";
  public displayContact = false;
  public error = "server_error";
  public error_description =
    "authentication aborted due to a technical error on the authorization server";
  public http_status_code = HttpStatus.BAD_REQUEST;
  public illustration = "temporary-restricted-error";
  public title = "Accès indisponible";
}
