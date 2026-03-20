import { BaseException } from "@fc/exceptions";
import { errors } from "oidc-provider";

export class OriginalError extends errors.OIDCProviderError {
  caught?: boolean;
  state?: string;
}
export class OidcProviderBaseException extends BaseException {
  public scope = 3;
  public error = "server_error";
  public error_description = "something bad happened";

  declare public originalError?: OriginalError;
}
