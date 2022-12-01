import { ErrorCode } from '../enums';
import { FeatureHandlerBaseException } from './feature-handler-base.exception';

export class FeatureHandlerEmptyException extends FeatureHandlerBaseException {
  code = ErrorCode.EMPTY_FEATURE_HANDLER;
  message =
    'Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter.';
}
