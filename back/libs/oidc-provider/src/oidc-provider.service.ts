/**
 * We sadly need `lodash` to override node-oid-provider
 * configuration function that relies on it.
 * @see OidcProviderService.overrideConfiguration()
 */
import { get } from 'lodash';
import { Provider, KoaContextWithOIDC, ClientMetadata } from 'oidc-provider';
import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost, Inject, Injectable } from '@nestjs/common';
import { FcExceptionFilter, FcException } from '@fc/error';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { SessionService } from '@fc/session';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { TrackingService } from '@fc/tracking';
import { IServiceProviderService, OidcCtx } from './interfaces';
import { SERVICE_PROVIDER_SERVICE } from './tokens';
import {
  OidcProviderEvents,
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
  OidcProviderRoutes,
  ErrorCode,
} from './enums';
import { OidcProviderConfig } from './dto';
import {
  OidcProviderInitialisationException,
  OidcProviderRuntimeException,
  OidcProviderBindingException,
  OidcProviderInteractionNotFoundException,
} from './exceptions';
import { RedisAdapter } from './adapters';
import {
  OidcProviderAuthorizationEvent,
  OidcProviderTokenEvent,
  OidcProviderUserinfoEvent,
} from './events';
import { HttpOptions } from 'openid-client';

@Injectable()
export class OidcProviderService {
  private ProviderProxy = Provider;
  private provider: Provider;
  private configuration;

  constructor(
    private httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
    readonly logger: LoggerService,
    @Inject(REDIS_CONNECTION_TOKEN)
    readonly redis: Redis,
    private readonly session: SessionService,
    @Inject(SERVICE_PROVIDER_SERVICE)
    private readonly serviceProviderService: IServiceProviderService,
    private readonly exceptionFilter: FcExceptionFilter,
    private readonly tracking: TrackingService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  async onModuleInit() {
    const { prefix, issuer, configuration } = await this.getConfig();
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
      this.httpAdapterHost.httpAdapter.use(prefix, this.provider.callback);
    } catch (error) {
      throw new OidcProviderBindingException(error);
    }

    this.registerMiddlewares();
    this.catchErrorEvents();
  }

  private registerMiddlewares() {
    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.AUTHORIZATION,
      this.authorizationMiddleware.bind(this),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.TOKEN,
      this.tokenMiddleware.bind(this),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.USERINFO,
      this.userinfoMiddleware.bind(this),
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

    const interactionId = this.getInteractionIdFromCtx(ctx);
    const ip: string = this.getIpFromCtx(ctx);

    // oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { client_id: spId, acr_values: spAcr } = ctx.oidc.params;

    const { name: spName } = await this.serviceProviderService.getById(spId);

    const sessionProperties = {
      spId,
      spAcr,
      spName,
    };
    await this.session.init(ctx.res, interactionId, sessionProperties);

    const eventContext = {
      fc: { interactionId },
      headers: { 'x-forwarded-for': ip },
      spId,
      spAcr,
      spName,
    };
    this.tracking.track(OidcProviderAuthorizationEvent, eventContext);
  }

  private tokenMiddleware(ctx) {
    try {
      const interactionId: string = this.getInteractionIdFromCtx(ctx);
      const ip: string = this.getIpFromCtx(ctx);
      const eventContext: object = {
        fc: { interactionId },
        headers: { 'x-forwarded-for': ip },
      };
      this.tracking.track(OidcProviderTokenEvent, eventContext);
    } catch (exception) {
      this.throwError(ctx, exception);
    }
  }

  private userinfoMiddleware(ctx) {
    try {
      const interactionId: string = this.getInteractionIdFromCtx(ctx);
      const ip: string = this.getIpFromCtx(ctx);
      const eventContext: object = {
        fc: { interactionId },
        headers: { 'x-forwarded-for': ip },
      };
      this.tracking.track(OidcProviderUserinfoEvent, eventContext);
    } catch (exception) {
      this.throwError(ctx, exception);
    }
  }

  private getIpFromCtx(ctx): string {
    return ctx.req.headers['x-forwarded-for'];
  }

  private getInteractionIdFromCtx(ctx) {
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

  private getInteractionIdFromCtxEntities(ctx) {
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

  private overrideConfiguration(configuration: object): void {
    /**
     * Use string literral because `configuration` is not exposed
     * by Provider interface
     */
    this.provider['configuration'] = (path: string) => {
      if (path) return get(configuration, path);
      return configuration;
    };
  }

  public async reloadConfiguration(): Promise<void> {
    const configuration = await this.getConfig(true);
    this.logger.debug(`Reload oidc-provider configuration.`);

    this.overrideConfiguration(configuration);
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

  catchErrorEvents() {
    const errorEvents = [
      OidcProviderEvents.AUTHORIZATION_ERROR,
      OidcProviderEvents.BACKCHANNEL_ERROR,
      OidcProviderEvents.JWKS_ERROR,
      OidcProviderEvents.CHECK_SESSION_ORIGIN_ERROR,
      OidcProviderEvents.CHECK_SESSION_ERROR,
      OidcProviderEvents.DISCOVERY_ERROR,
      OidcProviderEvents.END_SESSION_ERROR,
      OidcProviderEvents.GRANT_ERROR,
      OidcProviderEvents.INTROSPECTION_ERROR,
      OidcProviderEvents.PUSHED_AUTHORIZATION_REQUEST_ERROR,
      OidcProviderEvents.REGISTRATION_CREATE_ERROR,
      OidcProviderEvents.REGISTRATION_DELETE_ERROR,
      OidcProviderEvents.REGISTRATION_READ_ERROR,
      OidcProviderEvents.REGISTRATION_UPDATE_ERROR,
      OidcProviderEvents.REVOCATION_ERROR,
      OidcProviderEvents.SERVER_ERROR,
      OidcProviderEvents.USERINFO_ERROR,
    ];

    errorEvents.forEach((eventName) => {
      this.registerEvent(eventName, this.triggerError.bind(this, eventName));
    });
  }

  private triggerError(
    eventName: OidcProviderEvents,
    ctx: OidcCtx,
    error: Error,
  ) {
    let wrappedError: FcException;
    if (error instanceof FcException) {
      wrappedError = error;
    } else {
      wrappedError = new OidcProviderRuntimeException(
        error,
        ErrorCode[eventName.toUpperCase()],
      );
    }

    /**
     * Flag the request as invalid
     * to inform async tratment (event listeners)
     */
    ctx.oidc['isError'] = true;

    if (wrappedError.redirect === true) {
      this.throwError(ctx, wrappedError);
    }
  }

  /**
   * Wrap `oidc-provider` method to
   *  - lower coupling in other modules
   *  - handle exceptions
   *
   * @param req
   * @param res
   */
  async finishInteraction(req, res) {
    const { interactionId } = req.fc;
    const session = await this.session.get(interactionId);
    /**
     * Build Interaction results
     * For all available options, refer to `oidc-provider` documentation:
     * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#user-flows
     */
    const result = {
      login: {
        account: interactionId,
        acr: session.spAcr,
        amr: session.amr,
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

  /**
   * Register an event handler for `oidc-provider` built in events
   *
   * @param eventName on of possible event name
   * @param handler the function to execute when event is trigerred
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/events.md
   */
  registerEvent(eventName: OidcProviderEvents, handler) {
    // `oidc-provider` instance is an event emitter
    this.provider.on(eventName, handler);
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

      // run middleware BEFORE pattern occurs
      if (step === OidcProviderMiddlewareStep.BEFORE && path === pattern) {
        await middleware(ctx);
      }

      // Let pattern occur
      await next();

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
    });
  }

  /**
   * We can't just throw since oidc-provider has its own catch block
   * which would prevent us of reaching our NestJs exceptionFilter
   *
   * Hacky workarround:
   * 1. Exception filter is injected in the service
   * 2. Explicit call to the catch method
   *
   * We have to construct a fake ArgumentsHost host instance.
   * @param ctx Koa's `ctx` object
   * @param exception error to throw
   *
   * NB method is public to be callable from redis adapter.
   */
  private throwError(ctx, exception) {
    // Build fake ArgumentsHost host instance
    const host = FcExceptionFilter.ArgumentHostAdapter(ctx) as ArgumentsHost;

    // Finally call the exception filter
    this.exceptionFilter.catch(exception, host);
  }

  /**
   * Returned object should contains an `accountId` property
   * and an async `claims` function.
   * More documentation can be found in oidc-provider repo.
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#accounts
   */
  private async findAccount(ctx, interactionId: string) {
    this.logger.debug('OidcProviderService.findAccount()');

    try {
      const { spIdentity, amr } = await this.session.get(interactionId);

      return {
        accountId: interactionId,
        async claims() {
          return { ...spIdentity, amr };
        },
      };
    } catch (error) {
      // Hacky throw from oidc-provider
      this.throwError(ctx, error);
    }
  }

  /**
   * Passthru original identifier (sub).
   *
   * While we could imagine that `accountId` would carry the value set by the `findAccount` method above,
   * it actually carries the sub.
   *
   * We kept the parameter name to be consistent with documentation and original function signature
   * Note that the function receives a third parameter `client` but it is of no use for our implementation.
   *
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#pairwiseidentifier
   */
  private pairwiseIdentifier(_ctx, accountId: string) {
    return accountId;
  }

  /**
   *
   * @param {KoaContextWithOIDC} ctx Koa's `ctx` object
   * @param {string} out output body, we won't use it here.
   * @param {any} error error trown from oidc-provider
   *
   * @see https://github.com/panva/node-oidc-provider/tree/master/docs#rendererror
   */
  private renderError(ctx: KoaContextWithOIDC, _out: string, error: any) {
    // Instantiate our exception
    const exception = new OidcProviderRuntimeException(error);
    // Call our hacky "thrower"
    this.throwError(ctx, exception);
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#logoutsource
   * @TODO #109 Check the behaving of the page when javascript is disabled
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/issues/109
   */
  private async logoutSource(ctx: KoaContextWithOIDC, form: any) {
    ctx.body = `<!DOCTYPE html>
      <head>
        <title>Logout</title>
      </head>
      <body>
        ${form}
        <script>
          var form = document.forms[0];
          var input = document.createElement('input');
          input.type = 'hidden';
          input.name = 'logout';
          input.value = 'yes';
          form.appendChild(input);
          form.submit();
        </script>
      </body>
      </html>`;
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#interactionsurl
   */
  private async url(
    prefix: string,
    ctx: KoaContextWithOIDC,
    _interaction: any,
  ) {
    return `${prefix}/interaction/${ctx.oidc.uid}`;
  }

  private clientBasedCORS(
    _ctx: KoaContextWithOIDC,
    _origin: any,
    _client: ClientMetadata,
  ) {
    return false;
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables).
   *  - database (SP configuration).
   *
   * @param {boolean} refresh Default false
   * @returns {Promise<OidcProviderConfig>}
   */
  private async getConfig(refresh = false): Promise<OidcProviderConfig> {
    /**
     * Get SP's information from provided serviceProviderService
     */
    const clients = await this.serviceProviderService.getList(refresh);

    /**
     * Build our memory adapter for oidc-provider
     * @see https://github.com/panva/node-oidc-provider/tree/master/docs#adapter
     *
     * We can't use nest DI for our adapter.
     * `oidc-provider` wants a class and instantiate the adapter on it's own.
     * @see https://github.com/panva/node-oidc-provider/blob/9306f66bdbcdff01400773f26539cf35951b9ce8/lib/models/client.js#L201
     * @see https://github.com/panva/node-oidc-provider/blob/22cc547ffb45503cf2fc4357958325e0f5ed4b2f/lib/models/base_model.js#L28
     *
     * So we can not use directly NestJs DI to instantiate the adapter.
     *
     * The trick here is simple :
     * 1. We inject needed services in this service (oidcProviderService)
     * 2. We bind them to our adapter constructor.
     * 3. We give the resulting constructor to `oidc-provider`
     *
     * NB: If we want to add more services to the adapter,
     * we need add them to contructor and to pass them along here.
     */
    const adapter = RedisAdapter.getConstructorWithDI(this);

    /**
     * Get data from config file
     */
    const {
      prefix,
      issuer,
      configuration,
      forcedPrompt,
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    /**
     * Build final configuration object
     */
    return {
      forcedPrompt,
      prefix,
      issuer,
      configuration: {
        ...configuration,
        adapter,
        clients,
        findAccount: this.findAccount.bind(this),
        pairwiseIdentifier: this.pairwiseIdentifier.bind(this),
        renderError: this.renderError.bind(this),
        logoutSource: this.logoutSource.bind(this),
        clientBasedCORS: this.clientBasedCORS.bind(this),
        interactions: { url: this.url.bind(this, prefix) },
      },
    };
  }
}
