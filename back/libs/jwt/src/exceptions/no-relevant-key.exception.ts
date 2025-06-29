import { KekAlg, Use } from '@fc/cryptography';

import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class NoRelevantKeyException extends JwtBaseException {
  public code = ErrorCode.NO_RELEVANT_KEY;
  public documentation = 'Aucune clé pertinente trouvée';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  constructor(alg: KekAlg, use: Use) {
    super();
    this.log = `No relevant key found for alg: ${alg} and use: ${use}`;
  }
}
