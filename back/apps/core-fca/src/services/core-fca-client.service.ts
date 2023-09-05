
import { Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger-legacy';

export const MONCOMPTEPRO_UID = '54a380fd-876e-4cdc-88b5-5da9cf16f357';
export const PUBLICNESS_SCOPE = 'is_service_public';

@Injectable()
export class CoreFcaClientService {
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  private composeScope(scope: string, idpId: string): string {
    // if idpId is "MonComptePro", we add a special scope
    if (idpId !== MONCOMPTEPRO_UID) return scope;

    const scopeList = scope.split(' ');
    if (scopeList.includes(PUBLICNESS_SCOPE)) return scope;
    scopeList.push(PUBLICNESS_SCOPE);

    return scopeList.join(" ");
  }

  async getAuthorizeParams(
    state: string,
    scope: string,
    idpId: string,
    acr_values: string,
    nonce: string
  ) {
    scope = this.composeScope(scope, idpId);

    return {
      state,
      scope,
      idpId,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      nonce,
      /**
       * @todo #1021 Récupérer la vraie valeur du claims envoyé par le FS
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1021
       * @ticket FC-1021
       */
      claims: '{"id_token":{"amr":{"essential":true}}}',
      // No prompt is sent to the identity provider voluntary
    };
  }
}
