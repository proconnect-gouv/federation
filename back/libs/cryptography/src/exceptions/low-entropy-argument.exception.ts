import { ErrorCode } from '../enums';
import { CryptographyBaseException } from './cryptography-base.exception';

export class LowEntropyArgumentException extends CryptographyBaseException {
  public code = ErrorCode.LOW_ENTROPY;
  public documentation =
    "Problème de configuration dans la librairie de cryptographie (Une fonction de génération d'aléa requiert une longueur minimale pour éviter des collisions)";
  public ui = 'Cryptography.exceptions.lowEntropyArgument';
  public log = `${this.ui}, <${length}> given.`;
  constructor(public length: number) {
    super();
    this.name = 'LowEntropyArgumentException';
  }
}
