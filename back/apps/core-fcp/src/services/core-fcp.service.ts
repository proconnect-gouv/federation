import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreMissingAuthenticationEmailException } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { CoreFcpSendEmailHandler } from '../handlers';
import {
  FeatureHandler,
  IFeatureHandler,
  IFeatureHandlerDatabaseMap,
} from '@fc/feature-handler';
import { ProcessCore } from '../enums';

export type FcpFeature = {
  featureHandlers: IFeatureHandlerDatabaseMap<ProcessCore>;
};

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    public readonly moduleRef: ModuleRef,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * @param {object} req
   * @returns {Promise<void>}
   */
  async verify(req: any): Promise<void> {
    this.logger.debug('CoreFcpService.verify()');

    const { interactionId } = req.fc;

    const { idpId } = await this.session.get(interactionId);

    const handler = await this.getFeature<void>(idpId, ProcessCore.CORE_VERIFY);
    return await handler.handle(req);
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
   * @param {object} req Express
   * @returns {Promise<void>}
   */
  async sendAuthenticationMail(req: any): Promise<void> {
    this.logger.debug('CoreFcpService.sendAuthenticationMail()');

    const { interactionId } = req.fc;
    const { idpId } = await this.session.get(interactionId);
    const idp = await this.identityProvider.getById(idpId);

    let handler: CoreFcpSendEmailHandler;
    try {
      const { authenticationEmail } = idp.featureHandlers;
      handler = await FeatureHandler.get(authenticationEmail, this);
    } catch (e) {
      throw new CoreMissingAuthenticationEmailException(e);
    }
    return handler.handle(req);
  }
}
