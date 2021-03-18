/* istanbul ignore file */

// Declarative code
import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';

@Description(
  'Il manque des informations techniques dans la requête HTTP. Cette erreur ne devrait pas se produire, contacter le service technique',
)
export class CoreMissingContextException extends CoreBaseException {
  code = ErrorCode.MISSING_CONTEXT;
  message = "Erreur technique non communiquée à l'usager";

  constructor(field: string) {
    super(`Missing information in context: ${field}`);
  }
}
