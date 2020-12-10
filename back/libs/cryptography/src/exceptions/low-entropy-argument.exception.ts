import { Loggable, Description } from '@fc/error';
import { CryptographyBaseException } from './cryptography-base.exception';

@Loggable()
@Description(
  "Une fonction de génération d'aléa a été appelée avec un argument trop petit",
)
export class LowEntropyArgumentException extends CryptographyBaseException {
  constructor(length: number) {
    super();
    this.message = `Entropy must be at least 32 Bytes for random bytes generation, <${length}> given.`;
  }
}
