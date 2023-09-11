import { Injectable } from "@nestjs/common";
import { FeatureHandler, IFeatureHandler } from "@fc/feature-handler";
import { CoreFcaAuthorizationUrlAbstract } from "./core-fca-authorization-url.abstract";
import { LoggerService } from "@fc/logger-legacy";

export const PUBLICNESS_SCOPE = 'is_service_public';

@Injectable()
@FeatureHandler('core-fca-mcp-authorization-url')
export class CoreFcaMcpAuthorizationParamsHandler
  extends CoreFcaAuthorizationUrlAbstract
  implements IFeatureHandler {
  constructor(
    protected readonly logger: LoggerService,
  ) {
    super(logger);
  }

  private handleScopePublicness(scope:string): string {
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
    scope = this.handleScopePublicness(scope);

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