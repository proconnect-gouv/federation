import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { ISessionGenericService } from '@fc/session-generic';
import { OidcSession } from '@fc/oidc';
import { OidcClientSession } from '@fc/oidc-client';
import { CoreMissingAuthenticationEmailException } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { CoreFcpSendEmailHandler } from '../handlers';
import {
  FeatureHandler,
  IFeatureHandler,
  IFeatureHandlerDatabaseMap,
} from '@fc/feature-handler';
import { ProcessCore } from '../enums';
import { IVerifyFeatureHandler } from '../interfaces';

export type FcpFeature = {
  featureHandlers: IFeatureHandlerDatabaseMap<ProcessCore>;
};

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    public readonly moduleRef: ModuleRef,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * @param {ISessionGenericService<OidcClientSession>} sessionOidc
   * @returns {Promise<void>}
   */
  async verify(
    sessionOidc: ISessionGenericService<OidcClientSession>,
    trackingContext: Record<string, any>,
  ): Promise<void> {
    this.logger.debug('CoreFcpService.verify()');

    const { idpId } = await sessionOidc.get();

    const verifyHandler: IVerifyFeatureHandler = await this.getFeature<void>(
      idpId,
      ProcessCore.CORE_VERIFY,
    );

    return await verifyHandler.handle({ sessionOidc, trackingContext });
  }

  async getFeature<T>(
    idpId: string,
    process: ProcessCore,
  ): Promise<IFeatureHandler<T>> {
    this.logger.debug(`getFeature ${process} for provider: ${idpId}`);

    const idp = await this.identityProvider.getById<FcpFeature>(idpId);
    const idClass = idp.featureHandlers[process];

    return FeatureHandler.get(idClass, this);
  }

  /**
   * Send an email to the authenticated end-user after consent.
   *
   * @param {ISessionGenericService<OidcClientSession>} sessionOidc
   * @returns {Promise<void>}
   */
  async sendAuthenticationMail(session: OidcSession): Promise<void> {
    this.logger.debug('CoreFcpService.sendAuthenticationMail()');

    const { idpId } = session;
    const idp = await this.identityProvider.getById(idpId);

    let handler: CoreFcpSendEmailHandler;
    try {
      const { authenticationEmail } = idp.featureHandlers;
      handler = await FeatureHandler.get(authenticationEmail, this);
    } catch (e) {
      throw new CoreMissingAuthenticationEmailException(e);
    }
    await handler.handle(session);
  }
}
