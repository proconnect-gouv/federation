/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Description(
  "Erreur de communication avec le RNIPP (pas de réponse du RNIPP). L'utilisateur doit redémarrer sa cinématique. Si cela persiste, contacter le support N3",
)
export class RnippTimeoutException extends RnippBaseException {
  public readonly code = ErrorCode.REQUEST_TIMEOUT;

  constructor() {
    super('Une erreur technique est survenue, veuillez contacter le support.');
  }
}
