import { Response } from 'express';
import {
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';
import { HttpOptions } from 'openid-client';

import { Global, Injectable } from '@nestjs/common';

import { LoggerService } from '@fc/logger';
import { ExtendedInteraction } from '@fc/oidc-acr';
import { RedisService } from '@fc/redis';

import {
  OidcProviderEvents,
  OidcProviderMiddlewarePattern,
  OidcProviderMiddlewareStep,
  OidcProviderRoutes,
} from './enums';
import { OidcProviderInitialisationException } from './exceptions';
import {
  OidcProviderConfigAppService,
  OidcProviderConfigService,
} from './services';

export const COOKIES = ['_session', '_interaction', '_interaction_resume'];

/**
 * Make service global in order to ease retrieval and override from other libraries.
 * It is unlikely we will need multiple instances of this module any time.
 */
@Global()
@Injectable()
export class OidcProviderService {
  private ProviderProxy = Provider;
  private provider: Provider;
  private callback: ReturnType<Provider['callback']>;
  private configuration;

  constructor(
    readonly logger: LoggerService,
    readonly redis: RedisService,
    private readonly configService: OidcProviderConfigService,
    private readonly oidcProviderConfigApp: OidcProviderConfigAppService,
  ) {}

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */

  onModuleInit() {
    const { issuer, configuration } = this.configService.getConfig(this);
    this.configuration = configuration;

    try {
      this.provider = new this.ProviderProxy(issuer, {
        ...configuration,
        httpOptions: this.getHttpOptions.bind(this),
      });
      this.provider.proxy = true;
      this.callback = this.provider.callback();
    } catch (error) {
      throw new OidcProviderInitialisationException();
    }

    this.oidcProviderConfigApp.setProvider(this.provider);

    this.addLogListenerOnProviderEvents();
  }

  private addLogListenerOnProviderEvents() {
    const oidcProviderErrorEvents = OidcProviderEvents.filter((event) =>
      event.endsWith('.error'),
    );

    oidcProviderErrorEvents.forEach((event) => {
      /* istanbul ignore next */

      this.provider.on(event, (_any, err) => {
        if (
          [
            'invalid_client',
            'invalid_redirect_uri',
            'invalid_client_metadata',
          ].includes(err?.error)
        ) {
          // we do not want to log these errors as they are already logged in the renderError function
          return;
        }

        this.logger.error({
          code: `oidc-provider-error:${err?.error}`,
          event,
          originalError: err,
        });
      });
    });

    /* istanbul ignore next */
    this.provider.on('interaction.saved', (interaction) => {
      const {
        params: {
          client_id,
          login_hint,
          siret_hint,
          prompt,
          redirect_uri,
          scope,
          claims,
          response_type,
          idp_hint,
        },
        jti,
      } = interaction;

      this.logger.info({
        code: `oidc-provider-info:interaction.saved`,
        interaction: {
          client_id,
          login_hint,
          siret_hint,
          prompt,
          redirect_uri,
          response_type,
          scope,
          claims,
          idp_hint,
          id: jti,
        },
      });
    });
  }

  /**
   * Getter for external override module
   *
   * @warning Will return `undefined` before onModuleInit() is ran
   */
  getProvider(): Provider {
    return this.provider;
  }

  getCallback(): ReturnType<Provider['callback']> {
    return this.callback;
  }

  /**
   * Add global request timeout
   * @see https://github.com/panva/node-oidc-provider/blob/HEAD/docs/README.md#httpoptions
   *
   * @param {HttpOptions} options
   */
  private getHttpOptions(options: HttpOptions): HttpOptions {
    options.timeout = this.configuration.timeout;
    return options;
  }

  async getInteraction(req, res): Promise<ExtendedInteraction> {
    const interactionDetails = await this.provider.interactionDetails(req, res);

    return interactionDetails as ExtendedInteraction;
  }

  async abortInteraction(
    req: any,
    res: any,
    errorParams: InteractionResults,
    retry: boolean = false,
  ): Promise<void> {
    const result = retry ? {} : errorParams;
    const interactionFinished = await this.provider.interactionFinished(
      req,
      res,
      result,
    );
    return interactionFinished;
  }

  private async runMiddlewareBeforePattern(
    { step, path, pattern, ctx },
    middleware: Function,
  ) {
    // run middleware BEFORE pattern occurs
    if (step === OidcProviderMiddlewareStep.BEFORE && path === pattern) {
      await middleware(ctx);
    }
  }

  private async runMiddlewareAfterPattern(
    { step, route, path, pattern, ctx },
    middleware: Function,
  ) {
    // run middleware AFTER pattern occurred
    if (
      !this.isInError(ctx) &&
      this.shouldRunAfterPattern({ step, route, path, pattern })
    ) {
      await middleware(ctx);
    }
  }

  private shouldRunAfterPattern({ step, route, path, pattern }) {
    return (
      step === OidcProviderMiddlewareStep.AFTER &&
      /**
       * In the post processing phase, we may also target more specific actions with ctx.oidc.route
       * Though we can still match on the path.
       * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#pre--and-post-middlewares
       *
       * Since there can be no overlap between MiddlewarePatterns and Routes,
       * we can safely use a unique function parameter (`pattern`) and test it against both values.
       */
      (route === pattern || path === pattern)
    );
  }

  private isInError(ctx) {
    return ctx['oidc']?.isError === true;
  }

  /**
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#pre--and-post-middlewares
   */
  registerMiddleware(
    step: OidcProviderMiddlewareStep,
    pattern: OidcProviderMiddlewarePattern | OidcProviderRoutes,
    middleware: Function,
  ): void {
    this.provider.use(async (ctx: KoaContextWithOIDC, next: Function) => {
      // Extract path and oidc.route from ctx
      const { path, oidc: { route = '' } = {} } = ctx;

      await this.runMiddlewareBeforePattern(
        { step, path, pattern, ctx },
        middleware,
      );

      // Let pattern occur
      await next();

      await this.runMiddlewareAfterPattern(
        { step, route, path, pattern, ctx },
        middleware,
      );
    });
  }

  async finishInteraction(
    req: any,
    res: any,
    result: { amr: string[]; acr: string },
  ) {
    await this.oidcProviderConfigApp.finishInteraction(req, res, result);
  }

  clearCookies(res: Response) {
    COOKIES.forEach((cookieName) => {
      res.clearCookie(cookieName);
    });
  }
}
