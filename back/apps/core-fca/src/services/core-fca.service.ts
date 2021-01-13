import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { FeatureHandler } from '@fc/feature-handler';
import { IdentityProviderService } from '@fc/identity-provider';

@Injectable()
export class CoreFcaService {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly identityProvider: IdentityProviderService,
    public moduleRef: ModuleRef,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * @param req
   */
  async verify(req: any): Promise<void> {
    this.logger.debug('getConsent service');

    const { interactionId } = req.fc;

    const { idpId } = await this.session.get(interactionId);
    const idp = await this.identityProvider.getById(idpId);
    const { coreVerify } = idp.featureHandlers;

    const handler = await FeatureHandler.get(coreVerify, this);
    return await handler.handle(req);
  }
}
