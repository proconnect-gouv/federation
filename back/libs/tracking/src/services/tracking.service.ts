import { Global, Injectable, Scope } from '@nestjs/common';

import { UserSession } from '@fc/core';
import { LoggerService as LoggerLegacyService } from '@fc/logger-legacy';
import { SessionService } from '@fc/session';
import { trackedEventSteps } from '@fc/tracking/config/tracked-event-steps';

import { TrackedEvent } from '../enums';
import { ICoreTrackingLog, TrackedEventContextInterface } from '../interfaces';

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
  ): ICoreTrackingLog {
    const ip = trackedEventContext?.req.headers['x-forwarded-for'];

    const sessionId =
      trackedEventContext.sessionId || this.sessionService.getId();
    const {
      login_hint,
      browsingSessionId,
      interactionId,
      interactionAcr,
      spId,
      spEssentialAcr,
      spName,
      spIdentity,
      idpId,
      idpAcr,
      idpName,
      idpLabel,
      idpIdentity,
    } = this.sessionService.get<UserSession>('User') || {};

    return {
      browsingSessionId,
      event: trackedEvent,
      idpAcr,
      idpEmail: idpIdentity?.email,
      idpId,
      idpLabel,
      idpName,
      idpSub: idpIdentity?.sub,
      interactionAcr,
      interactionId,
      ip,
      login_hint,
      sessionId,
      spEmail: spIdentity?.email,
      spEssentialAcr,
      spId,
      spName,
      spSub: spIdentity?.sub,
      step: trackedEventSteps[trackedEvent],
    };
  }
}
