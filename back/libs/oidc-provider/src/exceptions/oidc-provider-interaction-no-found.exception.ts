/* istanbul ignore file */

// Declarative code
import { Description, Loggable } from '@fc/exceptions';

import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';
// declarative code
// istanbul ignore next line
@Loggable(false)
@Description(
  "L'identifiant de cinématique ( interactionId ) n'existe plus, cela peut être dû à une durée de session trop longue, ou une manipulation de cet identifiant par l'utilisateur.  Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3",
)
export class OidcProviderInteractionNotFoundException extends OidcProviderBaseException {
  public readonly code = ErrorCode.INTERACTION_NOT_FOUND;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
    );
  }
}
