import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { ActiveUserSessionDto, UserSession } from '@fc/core/dto';
import { CoreNoSessionIdException } from '@fc/core/exceptions';
import { generateErrorId } from '@fc/exceptions/helpers';
import { ErrorPageParams } from '@fc/exceptions/types/error-page-params';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService, TrackedEvent } from '@fc/logger';
import {
  OidcCtx,
  OidcProviderConfig,
  OidcProviderMiddlewareStep,
  OidcProviderPrompt,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionService } from '@fc/session';

@Injectable()
export class CoreFcaMiddlewareService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly oidcProvider: OidcProviderService,
    protected readonly sessionService: SessionService,
    protected readonly serviceProvider: ServiceProviderAdapterMongoService,
    protected readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {}

  protected koaHtmlErrorFormatterMiddlewareFactory(middleware: Function) {
    return async (ctx: OidcCtx) => {
      try {
        await middleware.bind(this)(ctx);
      } catch (err) {
        const code = 'koa_html_error_formater';
        const id = generateErrorId();

        this.logger.error({ code, id });

        const res = ctx.res as unknown as Response;
        ctx.type = 'html';
        // the render function is magically available in the koa context
        // as oidc-provider servers is mounted behind the nest server.
        const errorPageParams: ErrorPageParams = {
          exceptionDisplay: {},
          error: { code, id },
        };
        ctx.body = res.render('error', errorPageParams);

        throw err;
      }
    };
  }

  onModuleInit() {
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaHtmlErrorFormatterMiddlewareFactory(
        this.beforeAuthorizeMiddleware,
      ),
    );

    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaHtmlErrorFormatterMiddlewareFactory(
        this.handleSilentAuthenticationMiddleware,
      ),
    );

    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.TOKEN,
      this.tokenMiddleware.bind(this),
    );

    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.USERINFO,
      this.userinfoMiddleware.bind(this),
    );
  }

  protected getAuthorizationParameters({
    method,
    req,
  }: OidcCtx): AuthorizationParameters {
    const isPostMethod = method === 'POST';
    return isPostMethod ? req.body : req.query;
  }

  protected beforeAuthorizeMiddleware({ req, res }: OidcCtx): void {
    /**
     * Force cookies to be reset to prevent panva from keeping
     * a session open if you use several service provider in a row
     * @param ctx
     */
    this.oidcProvider.clearCookies(res);
    req.headers.cookie = '';
  }

  /**
   * Override authorize request `prompt` parameter.
   * We only support 'login' and 'consent' and enforce those.
   *
   * Overriding the parameters in the request allows us to influence
   * `oidc-provider` behavior and disable all 'SSO' or 'auto login' like features.
   *
   * We make sure that a new call to authorization endpoint will result
   * in a new interaction, whether user agent has a previous session.
   *
   * @param ctx
   * @param overrideValue
   */
  protected overrideAuthorizePrompt(ctx: OidcCtx): void {
    if (!['POST', 'GET'].includes(ctx.method)) {
      this.logger.warn(`Unsupported method "${ctx.method}".`);
      return;
    }

    const { forcedPrompt } =
      this.config.get<OidcProviderConfig>('OidcProvider');
    const overrideValue = forcedPrompt.join(' ');

    /**
     * Support both methods
     * @TODO #137 check what needs to be done if we implement pushedAuthorizationRequests
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/137
     */
    const isPostMethod = ctx.method === 'POST';
    const data = isPostMethod ? ctx.req.body : ctx.query;
    data.prompt = overrideValue;
  }

  protected async loadSessionInAsyncLocalStorage(
    ctx: OidcCtx,
  ): Promise<{ isSessionLoaded: boolean }> {
    const accountId = ctx.oidc?.entities?.Account?.accountId;

    if (!accountId) {
      // there may be an error in the request generated by oidc-provider
      return { isSessionLoaded: false };
    }

    const sessionId = await this.sessionService.getAlias(accountId);

    if (!sessionId) {
      throw new CoreNoSessionIdException();
    }

    await this.sessionService.initCache(sessionId);

    return { isSessionLoaded: true };
  }

  protected async tokenMiddleware(ctx: OidcCtx) {
    const { isSessionLoaded } = await this.loadSessionInAsyncLocalStorage(ctx);

    if (isSessionLoaded) {
      this.logger.track(TrackedEvent.SP_REQUESTED_FC_TOKEN);
    }
  }

  protected async userinfoMiddleware(ctx) {
    const { isSessionLoaded } = await this.loadSessionInAsyncLocalStorage(ctx);

    if (isSessionLoaded) {
      this.logger.track(TrackedEvent.SP_REQUESTED_FC_USERINFO);
    }
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

    const activeUserSession = plainToInstance(
      ActiveUserSessionDto,
      this.sessionService.get<UserSession>('User'),
    );
    const activeSessionValidationErrors = await validate(activeUserSession);

    const isUserConnectedAlready = activeSessionValidationErrors.length <= 0;

    if (isUserConnectedAlready && isSilentAuthentication) {
      // Given the Panva middlewares lack of active session awareness, overriding the prompt value is crucial to prevent
      // login-required errors. Silent authentication will be treated as a login attempt when an active session exists.
      this.overrideAuthorizePrompt(ctx);
    }
  }

  private isPromptStrictlyEqualNone(prompt: string) {
    const promptValues = prompt.split(' ');
    return (
      promptValues.length === 1 && promptValues[0] === OidcProviderPrompt.NONE
    );
  }
}
