import { Injectable } from '@nestjs/common';

import { overrideWithSourceIfNotNull } from '@fc/common';
import { UserSession } from '@fc/core';
import { SessionService } from '@fc/session';

import { TrackedEvent } from '../enums';
import { extractNetworkInfoFromHeaders } from '../helpers';
import {
  ICoreTrackingContext,
  ICoreTrackingLog,
  ICoreTrackingProviders,
  TrackedEventContextInterface,
} from '../interfaces';

@Injectable()
export class CoreTrackingService {
  constructor(private readonly sessionService: SessionService) {}

  buildLog(
    trackedEvent: TrackedEvent,
    context: TrackedEventContextInterface,
  ): ICoreTrackingLog {
    const extractedFromContext = this.extractContext(context);
    const {
      claims,
      source: { address: ip },
    } = extractedFromContext;

    const sessionId = context.sessionId || this.sessionService.getId();

    // Authorization route
    const extractedFromSession = this.getDataFromSession(sessionId);

    const ctxMergedWithSession = overrideWithSourceIfNotNull(
      extractedFromContext,
      extractedFromSession,
    );

    return {
      ...ctxMergedWithSession,
      sessionId,
      event: trackedEvent,
      ip,
      claims: claims?.join(' '),
    };
  }

  protected extractContext(
    ctx: TrackedEventContextInterface,
  ): ICoreTrackingContext {
    /**
     * Throw rather than allow a non-loggable interaction.
     *
     * This should never happen and is a *real* exception, not a business one.
     */

    const {
      sessionId,
      claims,
      interactionId,
      scope,
      dpId,
      dpClientId,
      dpTitle,
      browsingSessionId,
      reusesActiveSession,
      spId,
      spEssentialAcr,
      spName,
      idpId,
      idpAcr,
      idpName,
      idpLabel,
      idpIdentity,
      fqdn,
      email,
      idpSub,
    } = ctx;
    const source = extractNetworkInfoFromHeaders(ctx);

    return {
      source,
      sessionId,
      interactionId,
      claims,
      scope,
      dpId,
      dpClientId,
      dpTitle,
      browsingSessionId,
      reusesActiveSession,
      spId,
      spEssentialAcr,
      spName,
      idpId,
      idpAcr,
      idpName,
      idpLabel,
      idpIdentity,
      fqdn,
      email,
      idpSub,
    };
  }

  protected getDataFromSession(sessionId: string): ICoreTrackingProviders {
    const session = this.sessionService.get<UserSession>('User') || {};

    const {
      browsingSessionId = null,
      interactionId = null,
      interactionAcr = null,
      reusesActiveSession = null,

      spId = null,
      spEssentialAcr = null,
      spName = null,
      spIdentity = null,

      idpId = null,
      idpAcr = null,
      idpName = null,
      idpLabel = null,
      idpIdentity = null,
    } = session;

    return {
      browsingSessionId,
      interactionId,
      interactionAcr,
      reusesActiveSession,
      sessionId,

      spId,
      spEssentialAcr,
      spName,
      spSub: spIdentity?.sub || null,

      idpId,
      idpAcr,
      idpName,
      idpLabel,
      idpSub: idpIdentity?.sub || null,
    };
  }
}
