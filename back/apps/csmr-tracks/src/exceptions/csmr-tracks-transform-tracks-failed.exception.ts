/* istanbul ignore file */

// Declarative code
import { CsmrTracksErrorCode } from '../enums';
import { CsmrTracksBaseException } from './csmr-tracks-base.exception';

export class CsmrTracksTransformTracksFailedException extends CsmrTracksBaseException {
  static CODE = CsmrTracksErrorCode.TRANSFORM_TRACKS_FAILED;
  static DOCUMENTATION =
    'CsmrTracks.exceptions.csmrTracksTransformTracksFailed, something went wrong during mapping process';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'CsmrTracks.exceptions.csmrTracksTransformTracksFailed';
}
