import { HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../enums";
import { OidcClientBaseException } from "./oidc-client-base.exception";

export class AuthorizationResponseErrorException extends OidcClientBaseException {
  public code = ErrorCode.AUTHORIZATION_RESPONSE_ERROR;
  public error = "invalid_request";
  public error_description =
    "authentication aborted due to a technical error on the authorization server";
  public http_status_code = HttpStatus.BAD_GATEWAY;
}
