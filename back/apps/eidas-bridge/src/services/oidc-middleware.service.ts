import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import {
  OidcProviderMiddlewareStep,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ServiceProviderAdapterEnvService } from '@fc/service-provider-adapter-env';

@Injectable()
export class OidcMiddlewareService {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly serviceProvider: ServiceProviderAdapterEnvService,
    private readonly session: SessionService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async onModuleInit() {
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.AUTHORIZATION,
      this.authorizationMiddleware.bind(this),
    );
  }

  private async authorizationMiddleware(ctx) {
    /**
     * Abort middleware if authorize is in error
     *
     * We do not want to start a session
     * nor trigger authorization event for invalid requests
     */
    if (ctx.oidc['isError'] === true) {
      return;
    }

    const interactionId = this.oidcProvider.getInteractionIdFromCtx(ctx);

    // oidc defined variable name
    const { client_id: spId, acr_values: spAcr } = ctx.oidc.params;

    const { name: spName } = await this.serviceProvider.getById(spId);

    const sessionProperties = {
      spId,
      spAcr,
      spName,
    };
    await this.session.init(ctx.res, interactionId, sessionProperties);
  }
}
