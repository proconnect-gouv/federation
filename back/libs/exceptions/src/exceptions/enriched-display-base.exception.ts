import { BaseException } from './base.exception';

export class EnrichedDisplayBaseException extends BaseException {
  public title = 'Accès impossible';
  public description =
    'Nous n’arrivons pas à vous connecter à votre service en ligne pour l’instant.';
  public illustration = 'default-error';
  public displayContact = true;
  public contactMessage =
    'Vous pouvez nous signaler cette erreur en nous écrivant.';
  public contactHref: string;

  public mainAction: 'contact' | 'goBack' = 'goBack';
}
