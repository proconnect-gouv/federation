import { SessionService } from '@fc/session';
import { Injectable } from '@nestjs/common';
import { IEvent, IEventContext, IAppTrackingService } from '@fc/tracking';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import { getEventsMap } from '../events.map';
import {
  ICoreTrackingLog,
  ICoreTrackingProviders,
  ICoreTrackingContext,
} from '../interfaces';
import { CoreMissingContext } from '../exceptions';

@Injectable()
export class CoreTrackingService implements IAppTrackingService {
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
  ): Promise<ICoreTrackingLog> {
    const { ip, interactionId } = this.extractContext(context);
    const { step, category, event: eventName } = event;
    let data: ICoreTrackingProviders;

    // Authorization route
    if (event === this.EventsMap.FC_AUTHORIZE_INITIATED) {
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

  private extractContext(context: IEventContext): ICoreTrackingContext {
    /**
     * Throw rather than allow a non-loggable interaction.
     *
     * This should never happen and is a *real* exception, not a business one.
     */
    if (!context.req) {
      throw new CoreMissingContext('req');
    }
    if (!context.req.headers) {
      throw new CoreMissingContext('req.headers');
    }
    const ip = context.req.headers['x-forwarded-for'];
    if (!ip) {
      throw new CoreMissingContext("req.headers['x-forwarded-for']");
    }
    if (!context.req.fc) {
      throw new CoreMissingContext('req.fc');
    }
    if (!context.req.fc.interactionId) {
      throw new CoreMissingContext('req.fc.interactionId');
    }
    const {
      fc: { interactionId },
    } = context.req;

    return { ip, interactionId };
  }

  private async getDataFromSession(
    interactionId: string,
  ): Promise<ICoreTrackingProviders> {
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
  private getDataFromContext(context: IEventContext): ICoreTrackingProviders {
    if (!context.req) {
      throw new CoreMissingContext('req');
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
