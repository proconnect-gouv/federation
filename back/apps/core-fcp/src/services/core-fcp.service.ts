import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreMissingAuthenticationEmailException } from '@fc/core';
import { FeatureHandler } from '@fc/feature-handler';
import { IdentityProviderService } from '@fc/identity-provider';
import {
  CoreFcpDefaultVerifyHandler,
  CoreFcpEidasVerifyHandler,
  CoreFcpSendEmailHandler,
} from '../handlers';

@Injectable()
export class CoreFcpService {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly identityProvider: IdentityProviderService,
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
    const idp = await this.identityProvider.getById(idpId);
    const { coreVerify } = idp.featureHandlers;

    const handler:
      | CoreFcpDefaultVerifyHandler
      | CoreFcpEidasVerifyHandler = await FeatureHandler.get(coreVerify, this);
    return await handler.handle(req);
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
