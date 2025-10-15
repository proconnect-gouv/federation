import { Global, Injectable, Scope } from '@nestjs/common';

import { UserSession } from '@fc/core';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';
import { SessionService } from '@fc/session';
import { trackedEventSteps } from '@fc/tracking/config/tracked-event-steps';

import { TrackedEvent } from '../enums';
import {
  TrackedEventContextInterface,
  TrackedEventLogInterface,
} from '../interfaces';

@Global()
@Injectable({ scope: Scope.DEFAULT })
export class TrackingService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly loggerLegacy: LoggerLegacyService,
  ) {}

  // eslint-disable-next-line require-await
  async track(
    trackedEvent: TrackedEvent,
    context: TrackedEventContextInterface,
  ): Promise<void> {
    const message = this.buildLog(trackedEvent, context);

    this.loggerLegacy.businessEvent(message);
  }

  private buildLog(
    trackedEvent: TrackedEvent,
    trackedEventContext: TrackedEventContextInterface,
  ): TrackedEventLogInterface {
    const requestContext = this.makeRequestContext(trackedEventContext.req);

    const sessionId =
      trackedEventContext.sessionId || this.sessionService.getId();
    const {
      amr,
      browsingSessionId,
      interactionId,
      interactionAcr,
      spId,
      spEssentialAcr,
      spName,
      spIdentity,
      spLoginHint,
      idpId,
      idpAcr,
      idpName,
      idpLabel,
      idpLoginHint,
      idpIdentity,
    } = this.sessionService.get<UserSession>('User') || {};

    const sessionContext = {
      amr,
      browsingSessionId,
      event: trackedEvent,
      idpAcr,
      idpEmail: idpIdentity?.email,
      idpEmailFqdn: idpIdentity?.email?.split('@').pop().toLowerCase(),
      idpId,
      idpLabel,
      idpLoginHint,
      idpLoginHintFqdn: idpLoginHint?.split('@').pop().toLowerCase(),
      idpName,
      idpSiret: idpIdentity?.siret,
      idpSub: idpIdentity?.sub,
      interactionAcr,
      interactionId,
      sessionId,
      spEssentialAcr,
      spLoginHint,
      spLoginHintFqdn: spLoginHint?.split('@').pop().toLowerCase(),
      spId,
      spName,
      spSub: spIdentity?.sub,
      spSiret: spIdentity?.siret,
      step: trackedEventSteps[trackedEvent],
    };

    return { ...requestContext, ...sessionContext };
  }

  private makeRequestContext(req: TrackedEventContextInterface['req']) {
    const { baseUrl, headers = {}, ip, method, path } = req ?? {};
    const requestContext = {
      ip,
      forwardedFor: headers['x-forwarded-for'],
      method,
      path: `${baseUrl || ''}${path || ''}`,
      requestId: headers['x-request-id'],
    };
    return requestContext;
  }
}
