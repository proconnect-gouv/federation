/* istanbul ignore file */

// declarative code
import { Description, FcException } from '@fc/error';
import { ErrorCode } from '../enums';
@Description(
  "Le LightToken dépasse la taille maximum autoriées pour son traitement. Possiblement une erreur dans le format ou une tentative d'attaque.",
)
export class EidasOversizedTokenException extends FcException {
  public readonly code = ErrorCode.OVERSIZED_TOKEN_EXCEPTION;
}
