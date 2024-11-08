/* istanbul ignore file */

// declarative file

import { ErrorCode } from '../enums';
import { TracksBaseException } from './tracks-base.exception';

export class TracksResponseException extends TracksBaseException {
  static CODE = ErrorCode.TRACKS_RESPONSE;
  static DOCUMENTATION =
    "Une erreur s'est produite lors de la récupération des traces via le broker";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'Tracks.exceptions.tracksResponse';
}
