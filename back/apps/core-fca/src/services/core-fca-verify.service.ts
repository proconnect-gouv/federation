import { Request } from 'express';

import { Inject, Injectable } from '@nestjs/common';

import { CORE_VERIFY_SERVICE, CoreRoutes, CoreVerifyService } from '@fc/core';
import { ISessionService, Session } from '@fc/session';
import { TrackedEventContextInterface } from '@fc/tracking';

@Injectable()
export class CoreFcaVerifyService {
  constructor(
    @Inject(CORE_VERIFY_SERVICE)
    private readonly coreVerify: CoreVerifyService,
  ) {}

  async handleVerifyIdentity(
    req: Request,
    params: {
      urlPrefix: string;
      interactionId: string;
      sessionOidc: ISessionService<Session>;
    },
  ): Promise<string> {
    const { sessionOidc, urlPrefix } = params;
    const trackingContext: TrackedEventContextInterface = { req };

    await this.coreVerify.verify(sessionOidc, trackingContext);

    await this.coreVerify.trackVerified(req);

    const url = `${urlPrefix}${CoreRoutes.INTERACTION_LOGIN}`;
    return url;
  }

  /**
   * @todo #1581 exceptions v2
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1581
   * @ticket FC-1581
   */
  handleErrorLoginRequired(spRedirectUri: string) {
    const redirectUrl = new URL(spRedirectUri);
    const errorParams = new URLSearchParams({
      error: 'login_required',
      error_description: 'End-User authentication is required',
    });
    redirectUrl.search = errorParams.toString();

    return redirectUrl.toString();
  }
}
