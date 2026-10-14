import { EnrichedDisplayBaseException } from "#libs/exceptions/exceptions/index";

export class XdaBaseException extends EnrichedDisplayBaseException {
  public scope = 51;
  public illustration = "access-restricted-error";
  public displayContact = false;
}
