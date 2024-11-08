/* istanbul ignore file */

// Declarative code
import { CsmrTracksErrorCode } from '../enums';
import { CsmrTracksBaseException } from './csmr-tracks-base.exception';

export class CsmrTracksUnknownInstanceException extends CsmrTracksBaseException {
  static CODE = CsmrTracksErrorCode.UNKNOWN_INSTANCE;
  static DOCUMENTATION =
    "Le champ service de la trace n'a pas permis de déterminer le type d'instance pour lequel formatter la trace";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'CsmrTracks.exceptions.csmrTracksUnknownInstance';
}
