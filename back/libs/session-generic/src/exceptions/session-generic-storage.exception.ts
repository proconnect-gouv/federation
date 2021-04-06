/* istanbul ignore file */

// declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description('Problème de connexion au stockage des sessions (redis)')
export class SessionGenericStorageException extends SessionGenericBaseException {
  public readonly code = ErrorCode.STORAGE_ISSUE;

  constructor(error: Error) {
    super(error);
    this.message = 'Erreur technique';
  }
}
