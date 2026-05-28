import { HyyyperbridgeErrorCode } from "../enums";
import { HyyyperbridgeBaseException } from "./hyyyperbridge-base.exception";

export class HyyyperbridgeMissingVariableException extends HyyyperbridgeBaseException {
  public code = HyyyperbridgeErrorCode.MISSING_VARIABLE;
  public error = "server_error";
  public error_description =
    "authentication aborted due to a technical error on the authorization server";
}
