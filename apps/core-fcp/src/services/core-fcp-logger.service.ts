import { LoggerService } from '@fc/logger';
import { ServiceProviderService } from '@fc/service-provider';
import { SessionService } from '@fc/session';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreFcpLoggerService {
  constructor(
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly serviceProvider: ServiceProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async logEvent(params, ip, interactionId) {
    const { step, category, event } = params;

    const {
      spId,
      spAcr,
      spName,
      idpId = null,
      idpAcr = null,
      idpName = null,
    } = await this.session.get(interactionId);

    this.logger.businessEvent({
      interactionId,
      step,
      category,
      event,
      ip,
      spId,
      spAcr,
      spName,
      idpId,
      idpName,
      idpAcr,
    });
  }

  /**
   * Authorize logging can't rely on session since session is not created at this stage.
   * We have to do specific work to retrieve informations to log.
   *
   * @param ctx
   */
  async logAuthorize(params, properties) {
    const { step, category, event } = params;
    const { interactionId, ip, spId, spAcr } = properties;
    // get sp name
    const { name: spName } = await this.serviceProvider.getById(spId);

    this.logger.businessEvent({
      interactionId,
      step,
      category,
      event,
      ip,
      spId,
      spAcr,
      spName,
    });
  }
}
