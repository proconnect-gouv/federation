/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';

@Description('Erreur techique dans le protocole OIDC, contacter SN3 (FC > FI)')
export class OidcClientRuntimeException extends OidcClientBaseException {
  code = ErrorCode.RUNTIME;
  message = 'Erreur technique';
}
