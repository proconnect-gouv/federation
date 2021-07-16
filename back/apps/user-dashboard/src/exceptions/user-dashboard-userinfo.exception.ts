import { Description } from '@fc/exceptions';
import { UserDashboardBaseException } from './user-dashboard-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line

@Description(
  "Une erreur s'est produite lors de la récupération des données utilisateurs depuis le userdashboard. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3",
)
export class UserDashboardUserinfoException extends UserDashboardBaseException {
  code = ErrorCode.USERINFO;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous. Si le problème persiste, contacter le support.',
    );
  }
}
