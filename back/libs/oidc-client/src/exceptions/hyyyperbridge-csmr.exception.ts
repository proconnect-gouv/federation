import { HyyyperbridgeErrorDto } from "@fc/hyyyperbridge";
import { HyyyperbridgeErrorCode } from "../enums";
import { HyyyperbridgeBaseException } from "./hyyyperbridge-base.exception";

export class HyyyperbridgeCsmrException extends HyyyperbridgeBaseException {
  public code = HyyyperbridgeErrorCode.CSMR_ERROR;
  public error = "server_error";
  public error_description =
    "authentication aborted due to a technical error on the authorization server";

  public reference: string;
  public name: string;
  public reason: string;

  from(error: HyyyperbridgeErrorDto) {
    const { code: reference, name, reason } = error;
    this.reference = reference;
    this.name = name;
    this.reason = reason;
    return this;
  }
}
