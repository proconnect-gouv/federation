/* istanbul ignore file */

// Declarative code
import { CsmrTracksErrorCode } from '../enums';
import { CsmrTracksBaseException } from './csmr-tracks-base.exception';

export class CsmrTracksAccountResponseException extends CsmrTracksBaseException {
  static CODE = CsmrTracksErrorCode.ACCOUNT_ID_CSMR_FAILED;
  static DOCUMENTATION =
    'CsmrTracks.exceptions.csmrTracksAccountResponse, please check the consumer results';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'CsmrTracks.exceptions.csmrTracksAccountResponse';
}
