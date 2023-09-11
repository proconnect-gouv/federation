import { FeatureHandler, IFeatureHandler } from "@fc/feature-handler";
import { LoggerService } from "@fc/logger-legacy";
import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { IAuthorizationUrlFeatureHandlerHandleArgument } from "../interfaces/authorization-url-feature-handler.handler";

export const FCA_AUTHORIZATION_URL= 'fcaAuthorizationUrl';

@Injectable()
export class CoreFcaAuthorizationUrl {
  constructor(
    private readonly logger: LoggerService,
    public readonly moduleRef: ModuleRef,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async getAuthorizeUrl<T extends IFeatureHandler>({
    oidcClient,
    state,
    scope,
    idpId,
    idpFeatureHandlers,
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
      acr_values,
      nonce,
      spId,
    });
  }
}
