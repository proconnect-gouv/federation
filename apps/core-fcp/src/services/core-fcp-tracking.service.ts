import { SessionService } from '@fc/session';
import { Injectable } from '@nestjs/common';
import { IEvent, IEventContext, IAppTrackingService } from '@fc/tracking';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import { getEventsMap } from '../events.map';
import {
  ICoreFcpTrackingLog,
  ICoreFcpTrackingProviders,
  ICoreFcpTrackingContext,
} from '../interfaces';
import { CoreFcpMissingContext } from '../exceptions';

@Injectable()
export class CoreFcpTrackingService implements IAppTrackingService {
  readonly EventsMap;

  constructor(
    private readonly session: SessionService,
    private readonly config: ConfigService,
  ) {
    this.EventsMap = getEventsMap(this.config.get<AppConfig>('App').urlPrefix);
  }

  async buildLog(
    event: IEvent,
    context: IEventContext,
  ): Promise<ICoreFcpTrackingLog> {
    const { ip, interactionId } = this.extractContext(context);
    const { step, category, event: eventName } = event;
    let data: ICoreFcpTrackingProviders;

    // Authorization route
    if (event === this.EventsMap.FCP_AUTHORIZE_INITIATED) {
      data = this.getDataFromContext(context);
    } else {
      data = await this.getDataFromSession(interactionId);
    }

    return {
      interactionId,
      step,
      category,
      event: eventName,
      ip,
      ...data,
    };
  }

  private extractContext(context: IEventContext): ICoreFcpTrackingContext {
    /**
     * Throw rather than allow a non-loggable interaction.
     *
     * This should never happen and is a *real* exception, not a business one.
     */
    if (!context.req) {
      throw new CoreFcpMissingContext('req');
    }
    if (!context.req.headers) {
      throw new CoreFcpMissingContext('req.headers');
    }
    const ip = context.req.headers['x-forwarded-for'];
    if (!ip) {
      throw new CoreFcpMissingContext("req.headers['x-forwarded-for']");
    }
    if (!context.req.fc) {
      throw new CoreFcpMissingContext('req.fc');
    }
    if (!context.req.fc.interactionId) {
      throw new CoreFcpMissingContext('req.fc.interactionId');
    }
    const {
      fc: { interactionId },
    } = context.req;

    return { ip, interactionId };
  }

  private async getDataFromSession(
    interactionId: string,
  ): Promise<ICoreFcpTrackingProviders> {
    const {
      spId,
      spAcr,
      spName,
      spIdentity = null,

      idpId = null,
      idpAcr = null,
      idpName = null,
      idpIdentity = null,
    } = await this.session.get(interactionId);

    return {
      spId,
      spAcr,
      spName,
      /**
       * @TODO #146 ETQ dev, j'élucide le mystère sur le spIdentity qui est undefined pendant la cinématique
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/229
       */
      spSub: spIdentity?.sub || null,

      idpId,
      idpAcr,
      idpName,
      idpSub: idpIdentity?.sub || null,
    };
  }

  /**
   * Authorize logging can't rely on session since session is not created at this stage.
   * We have to do specific work to retrieve informations to log.
   */
  private getDataFromContext(
    context: IEventContext,
  ): ICoreFcpTrackingProviders {
    if (!context.req) {
      throw new CoreFcpMissingContext('req');
    }
    const { spId, spAcr, spName, spSub } = context.req;

    return {
      spId,
      spAcr,
      spName,
      spSub,

      idpId: null,
      idpAcr: null,
      idpName: null,
      idpSub: null,
    };
  }
}
