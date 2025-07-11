import { Response } from 'express';
import {
  InteractionResults,
  KoaContextWithOIDC,
  Provider,
} from 'oidc-provider';
import { HttpOptions } from 'openid-client';

import { Global, Injectable } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { LoggerService } from '@fc/logger';
import { RedisService } from '@fc/redis';

import {
  OidcProviderMiddlewarePattern,
  OidcProviderMiddlewareStep,
  OidcProviderRoutes,
} from './enums';
import {
  OidcProviderBindingException,
  OidcProviderInitialisationException,
  OidcProviderRuntimeException,
} from './exceptions';
import {
  OidcProviderConfigAppService,
  OidcProviderConfigService,
  OidcProviderErrorService,
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
  private configuration;

  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private httpAdapterHost: HttpAdapterHost,
    readonly logger: LoggerService,
    readonly redis: RedisService,
    private readonly errorService: OidcProviderErrorService,
    private readonly configService: OidcProviderConfigService,
    private readonly oidcProviderConfigApp: OidcProviderConfigAppService,
  ) {}

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */

  onModuleInit() {
    const { prefix, issuer, configuration } =
      this.configService.getConfig(this);
    this.configuration = configuration;

    try {
      this.provider = new this.ProviderProxy(issuer, {
        ...configuration,
        httpOptions: this.getHttpOptions.bind(this),
      });
      this.provider.proxy = true;
    } catch (error) {
      throw new OidcProviderInitialisationException();
    }

    this.oidcProviderConfigApp.setProvider(this.provider);

    try {
      /**
       * @see https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#mounting-oidc-provider
       */
      this.httpAdapterHost.httpAdapter.use(prefix, this.provider.callback());
    } catch (error) {
      throw new OidcProviderBindingException();
    }

    this.errorService.catchErrorEvents(this.provider);
  }

  /**
   * Getter for external override module
   *
   * @warning Will return `undefined` before onModuleInit() is ran
   */
  getProvider(): Provider {
    return this.provider;
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

  /**
   * @todo #1023 je type les entrées et sortie correctement et non pas avec any
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1023
   * @ticket #FC-1023
   */
  /**
   * Wrap `oidc-provider` method to
   *  - lower coupling in other modules
   *  - handle exceptions
   *
   * @param req
   * @param res
   */
  // `oidc-provider` does not provide a type for interaction
  async getInteraction(req, res): Promise<any> {
    try {
      const interactionDetails = await this.provider.interactionDetails(
        req,
        res,
      );

      return interactionDetails;
    } catch (error) {
      throw new OidcProviderRuntimeException(error);
    }
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
