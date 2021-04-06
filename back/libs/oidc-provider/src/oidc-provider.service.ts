import { get } from 'lodash';
import { HttpOptions } from 'openid-client';
import { Provider, KoaContextWithOIDC } from 'oidc-provider';
import { HttpAdapterHost } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { OidcSession } from '@fc/oidc';
import { OidcClientSession } from '@fc/oidc-client';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import {
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
  OidcProviderRoutes,
} from './enums';
import {
  OidcProviderInitialisationException,
  OidcProviderRuntimeException,
  OidcProviderBindingException,
  OidcProviderInteractionNotFoundException,
} from './exceptions';
import {
  OidcProviderErrorService,
  OidcProviderConfigService,
} from './services';

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
    @Inject(REDIS_CONNECTION_TOKEN)
    readonly redis: Redis,
    private readonly errorService: OidcProviderErrorService,
    private readonly configService: OidcProviderConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  async onModuleInit() {
    const {
      prefix,
      issuer,
      configuration,
    } = await this.configService.getConfig(this);
    this.configuration = configuration;

    this.logger.debug('Initializing oidc-provider');
    try {
      this.provider = new this.ProviderProxy(issuer, {
        ...configuration,
        httpOptions: this.getHttpOptions.bind(this),
      });
      this.provider.proxy = true;
    } catch (error) {
      throw new OidcProviderInitialisationException(error);
    }

    this.logger.debug('Mouting oidc-provider middleware');
    try {
      /**
       * @see https://github.com/panva/node-oidc-provider/blob/main/docs/README.md#mounting-oidc-provider
       */
      this.httpAdapterHost.httpAdapter.use(prefix, this.provider.callback);
    } catch (error) {
      throw new OidcProviderBindingException(error);
    }

    this.errorService.catchErrorEvents(this.provider);
  }

  // Reverse engineering of PANVA library
  getInteractionIdFromCtx(ctx) {
    let interactionId: string;

    switch (ctx.req.url) {
      case OidcProviderRoutes.TOKEN:
      case OidcProviderRoutes.USERINFO:
        interactionId = this.getInteractionIdFromCtxEntities(ctx);
        break;
      default:
        interactionId = this.getInteractionIdFromCtxSymbol(ctx);
        break;
    }

    if (!interactionId) {
      throw new OidcProviderInteractionNotFoundException(
        'Could not find interactionId in ctx.oidc',
      );
    }

    return interactionId;
  }

  getInteractionIdFromCtxEntities(ctx) {
    return get(ctx, 'oidc.entities.Account.accountId');
  }

  /**
   * `oidc-provider stores the interaction id in a key that is a symbol.
   */
  private getInteractionIdFromCtxSymbol(ctx) {
    const symbolStringRepresentation = 'Symbol(context#uid)';

    const interactionIdSymbol = Object.getOwnPropertySymbols(ctx.oidc).find(
      (symbol) => symbol.toString() === symbolStringRepresentation,
    );

    return ctx.oidc[interactionIdSymbol];
  }

  /**
   * Getter for external override module
   *
   * @warning Will return `undefined` before onModuleInit() is ran
   */
  getProvider(): Provider {
    return this.provider;
  }

  async reloadConfiguration(): Promise<void> {
    const configuration = await this.configService.getConfig(this);
    this.logger.debug(`Reload oidc-provider configuration.`);

    this.configService.overrideConfiguration(configuration, this.provider);
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
   * Wrap `oidc-provider` method to
   *  - lower coupling in other modules
   *  - handle exceptions
   *
   * @param req
   * @param res
   */
  async getInteraction(req, res): Promise<any> {
    try {
      return await this.provider.interactionDetails(req, res);
    } catch (error) {
      throw new OidcProviderRuntimeException(error);
    }
  }

  /**
   * Wrap `oidc-provider` method to
   *  - lower coupling in other modules
   *  - handle exceptions
   *
   * @param {any} req
   * @param {any} res
   * @param {OidcSession} session Object that contains the session info
   */
  async finishInteraction(req: any, res: any, session: OidcSession) {
    const {
      interactionId: account,
      spAcr: acr,
      amr,
    }: OidcClientSession = session;
    /**
     * Build Interaction results
     * For all available options, refer to `oidc-provider` documentation:
     * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#user-flows
     */
    const result = {
      login: {
        account,
        acr,
        amr,
        ts: Math.floor(Date.now() / 1000),
      },
      /**
       * We need to return this information, it will always be empty arrays
       * since franceConnect does not allow for partial authorizations yet,
       * it's an "all or nothing" consent.
       */
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
    };

    try {
      return await this.provider.interactionFinished(req, res, result);
    } catch (error) {
      throw new OidcProviderRuntimeException(error);
    }
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
    // run middleware AFTER pattern occured
    if (
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
    ) {
      await middleware(ctx);
    }
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
}
