import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class CoreFailedPersistenceException extends CoreBaseException {
  public code = ErrorCode.FAILED_PERSISTENCE;
  public documentation = `L'enregistrement de l'Account en base de donnée a échoué. Ce cas est anormal, il faut prévenir l'équipe technique.`;
  public ui =
    'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.';
}
