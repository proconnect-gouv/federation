/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

@Description(
  `Erreur émise lorsque l'usager n'a plus de session, probablement une fenêtre restée ouverte au delà des 10 minutes.`,
)
export class SessionNotFoundException extends SessionBaseException {
  public readonly code = ErrorCode.NOT_FOUND;
  public message = 'Session not found';
}
