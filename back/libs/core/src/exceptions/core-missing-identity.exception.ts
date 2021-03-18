/* istanbul ignore file */

// Declarative code
import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';

@Description(
  "Des étapes de la cinématique ont été omises (identité non disponible en session, l'usager doit redémarrer sa cinématique depuis le FS)",
)
export class CoreMissingIdentityException extends CoreBaseException {
  code = ErrorCode.MISSING_IDENTITY;
  message = 'Erreur technique, veuillez refaire votre connexion à partir du FS';
}
