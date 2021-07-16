import { Description } from '@fc/exceptions';
import { MockServiceProviderBaseException } from './mock-service-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line

@Description(
  "Une erreur s'est produite lors de la récupération des données utilisateurs depuis un FS de démo. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3",
)
export class MockServiceProviderUserinfoException extends MockServiceProviderBaseException {
  code = ErrorCode.USERINFO;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous. Si le problème persiste, contacter le support.',
    );
  }
}
