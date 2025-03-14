import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@fc/core';

import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaInvalidIdentityException extends CoreFcaBaseException {
  constructor(
    public contact: string,
    public validationConstraints = 'Les champs en erreur ne sont pas connus.',
    public validationTarget: string = '',
  ) {
    super();
  }

  static DOCUMENTATION =
    'Nous ne pouvons pas vérifier votre identité auprès de la source officielle : certains éléments ont un format invalide. Nous vous conseillons de contacter le service informatique de votre organisation ou ministère.';
  static CODE = ErrorCode.INVALID_IDENTITY;
  static HTTP_STATUS_CODE = HttpStatus.BAD_REQUEST;
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';

  public description = CoreFcaInvalidIdentityException.DOCUMENTATION;
  public displayContact = true;
  public contactMessage = 'Signaler l’erreur au service informatique concerné.';
  public contactHref = `mailto:${this.contact}?subject=Mise à jour de mon profil pour compatibilité ProConnect&body=Bonjour\n,Voici une erreur remontée par ProConnect suite à une tentative de connexion infructueuse.\n${this.validationConstraints}\nVoici l’identité telle que reçue par ProConnect :\n${this.validationTarget}\nProConnect a vérifié que l’erreur ne venait pas de leur côté.\nMerci de corriger mes informations d'identité afin que ProConnect reconnaisse mon identité et que je puisse me connecter.\nCordialement,`;
}
