import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { FeatureHandler, IFeatureHandler } from '@fc/feature-handler';
import { LoggerService } from '@fc/logger-legacy';

import { IAuthorizationUrlFeatureHandlerHandleArgument } from '../interfaces/authorization-url-feature-handler.handler';

export const FCA_AUTHORIZATION_URL = 'fcaAuthorizationUrl';

@Injectable()
export class CoreFcaAuthorizationUrl {
  constructor(
    private readonly logger: LoggerService,
    public readonly moduleRef: ModuleRef,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  getAuthorizeUrl<T extends IFeatureHandler>({
    oidcClient,
    state,
    scope,
    idpId,
    idpFeatureHandlers,
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values,
    nonce,
    spId,
  }: IAuthorizationUrlFeatureHandlerHandleArgument) {
    const idClass = idpFeatureHandlers[FCA_AUTHORIZATION_URL];
    const authorizationUrlhandler = FeatureHandler.get<T>(idClass, this);
    return authorizationUrlhandler.handle({
      oidcClient,
      state,
      scope,
      idpId,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      nonce,
      spId,
    });
  }
}
