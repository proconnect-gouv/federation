import { SessionService } from '@fc/session';
import { Injectable } from '@nestjs/common';
import { IEvent, IEventContext, IAppTrackingService } from '@fc/tracking';
import { EventsMap } from '../events.map';
import {
  ICoreFcpTrackingLog,
  ICoreFcpTrackingProviders,
  ICoreFcpTrackingContext,
} from '../interfaces';
import { CoreFcpMissingContext } from '../exceptions';

@Injectable()
export class CoreFcpTrackingService implements IAppTrackingService {
  readonly EventsMap = EventsMap;

  constructor(private readonly session: SessionService) {}

  async buildLog(
    event: IEvent,
    context: IEventContext,
  ): Promise<ICoreFcpTrackingLog> {
    const { ip, interactionId } = this.extractContext(context);
    const { step, category, event: eventName } = event;
    let data: ICoreFcpTrackingProviders;

    // Authorization route
    if (event === EventsMap.FCP_AUTHORIZE_INITIATED) {
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
    if (!context.req.ip) {
      throw new CoreFcpMissingContext('req.ip');
    }
    if (!context.req.fc) {
      throw new CoreFcpMissingContext('req.fc');
    }
    if (!context.req.fc.interactionId) {
      throw new CoreFcpMissingContext('req.fc.interactionId');
    }

    const {
      ip,
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
      idpId = null,
      idpAcr = null,
      idpName = null,
    } = await this.session.get(interactionId);

    return { spId, spAcr, spName, idpId, idpAcr, idpName };
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
    const { spId, spAcr, spName } = context.req;

    return { spId, spAcr, spName, idpId: null, idpAcr: null, idpName: null };
  }
}
