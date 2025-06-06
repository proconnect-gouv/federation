import { Inject, Injectable } from '@nestjs/common';

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { CoreOidcProviderMiddlewareService } from '@fc/core';
import { ActiveUserSessionDto, UserSession } from '@fc/core-fca/dto';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { stringToArray } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  OidcCtx,
  OidcProviderErrorService,
  OidcProviderMiddlewareStep,
  OidcProviderPrompt,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

@Injectable()
export class CoreFcaMiddlewareService extends CoreOidcProviderMiddlewareService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly oidcProvider: OidcProviderService,
    protected readonly sessionService: SessionService,
    protected readonly serviceProvider: ServiceProviderAdapterMongoService,
    protected readonly tracking: TrackingService,
    protected readonly oidcErrorService: OidcProviderErrorService,
    protected readonly oidcAcr: OidcAcrService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    protected readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {
    super(
      logger,
      config,
      oidcProvider,
      sessionService,
      serviceProvider,
      tracking,
      oidcErrorService,
      oidcAcr,
      identityProvider,
    );
  }

  onModuleInit() {
    this.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaErrorCatcherMiddlewareFactory(this.beforeAuthorizeMiddleware),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaErrorCatcherMiddlewareFactory(
        this.handleSilentAuthenticationMiddleware,
      ),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.TOKEN,
      this.koaErrorCatcherMiddlewareFactory(this.tokenMiddleware),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.USERINFO,
      this.koaErrorCatcherMiddlewareFactory(this.userinfoMiddleware),
    );
  }

  protected async handleSilentAuthenticationMiddleware(
    ctx: OidcCtx,
  ): Promise<void> {
    const { prompt } = this.getAuthorizationParameters(ctx);

    if (!prompt) {
      return this.overrideAuthorizePrompt(ctx);
    }

    const isSilentAuthentication = this.isPromptStrictlyEqualNone(prompt);

    // Persist this flag to adjust redirections during '/verify'
    this.sessionService.set(
      'User',
      'isSilentAuthentication',
      isSilentAuthentication,
    );
    await this.sessionService.commit();

    const activeSessionValidationErrors = await validateDto(
      this.sessionService.get<UserSession>('User') as object,
      ActiveUserSessionDto,
      {},
    );

    const isUserConnectedAlready = activeSessionValidationErrors.length <= 0;

    if (isUserConnectedAlready && isSilentAuthentication) {
      // Given the Panva middlewares lack of active session awareness, overriding the prompt value is crucial to prevent
      // login-required errors. Silent authentication will be treated as a login attempt when an active session exists.
      this.overrideAuthorizePrompt(ctx);
    }
  }

  private isPromptStrictlyEqualNone(prompt: string) {
    if (!prompt) {
      return false;
    }
    const promptValues = stringToArray(prompt);
    return (
      promptValues.length === 1 && promptValues[0] === OidcProviderPrompt.NONE
    );
  }
}
