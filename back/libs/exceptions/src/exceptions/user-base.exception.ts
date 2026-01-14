import { FcException } from './fc.exception';

export class UserBaseException extends FcException {
  public title = 'Accès impossible';
  public description =
    'Nous n’arrivons pas à vous connecter à votre service en ligne pour l’instant.';
  public illustration = 'default-error';
  public contactHref: string;
  public displayContact: boolean;
  public contactMessage =
    'Vous pouvez nous signaler cette erreur en nous écrivant.';
}
