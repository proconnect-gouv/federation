import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { UserSession } from '@fc/core';
import { LoggerPluginServiceInterface } from '@fc/logger';
import { SessionService } from '@fc/session';

@Injectable()
export class LoggerSessionService implements LoggerPluginServiceInterface {
  constructor(private moduleRef: ModuleRef) {}

  getContext(): Record<string, unknown> {
    const sessionService = this.moduleRef.get(SessionService, {
      strict: false,
    });

    const sessionId = sessionService.getId();
    const {
      amr,
      browsingSessionId,
      interactionId,
      interactionAcr,
      spId,
      spEssentialAcr,
      spName,
      spIdentity,
      spSiretHint,
      spLoginHint,
      idpId,
      idpAcr,
      idpName,
      idpLabel,
      idpLoginHint,
      idpIdentity,
    } = sessionService.get<UserSession>('User') || {};

    const context = {
      amr,
      browsingSessionId,
      idpAcr,
      idpBelongingPopulation: idpIdentity?.belonging_population,
      idpEmail: idpIdentity?.email,
      idpEmailFqdn: idpIdentity?.email?.split('@').pop().toLowerCase(),
      idpId,
      idpLabel,
      idpLoginHint,
      idpLoginHintFqdn: idpLoginHint?.split('@').pop().toLowerCase(),
      idpName,
      idpOrganizationalUnit: idpIdentity?.organizational_unit,
      idpSiret: idpIdentity?.siret,
      idpSub: idpIdentity?.sub,
      interactionAcr,
      interactionId,
      sessionId,
      spCustom: spIdentity?.custom,
      spEssentialAcr,
      spId,
      spLoginHint,
      spLoginHintFqdn: spLoginHint?.split('@').pop().toLowerCase(),
      spName,
      spSiret: spIdentity?.siret,
      spSiretHint,
      spSub: spIdentity?.sub,
    };

    return context;
  }
}
