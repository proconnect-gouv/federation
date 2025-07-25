import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { TrackingBaseException } from './tracking-base.exception';

export class TrackingMissingNetworkContextException extends TrackingBaseException {
  public code = ErrorCode.MISSING_HEADERS;
  public documentation =
    "L'application n'a pas trouvé de headers dans l'objet request, c'est probablement un bug, Contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'TrackingContext.exceptions.trackingMissingNetworkContext';
}
