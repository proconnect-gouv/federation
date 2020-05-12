/**
 * We sadly need `lodash` to override node-oid-provider
 * configuration function that relies on it.
 * @see OidcProviderService.overrideConfiguration()
 */
import { get } from 'lodash';
import { Provider, KoaContextWithOIDC } from 'oidc-provider';
import { JWK } from 'jose';
import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost, Inject, Injectable } from '@nestjs/common';
import { FcExceptionFilter, FcException } from '@fc/error';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { IIdentityService, IServiceProviderService } from './interfaces';
import { IDENTITY_SERVICE, SERVICE_PROVIDER_SERVICE } from './tokens';
import {
  OidcProviderEvents,
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
  ErrorCode,
} from './enums';
import { OidcProviderConfig } from './dto';
import {
  OidcProviderInitialisationException,
  OidcProviderRuntimeException,
  OidcProviderBindingException,
} from './exceptions';
import { RedisAdapter } from './adapters';

@Injectable()
export class OidcProviderService {
  private ProviderProxy = Provider;
  private provider: Provider;

  constructor(
    private httpAdapterHost: HttpAdapterHost,
    private readonly config: ConfigService,
    readonly logger: LoggerService,
    @Inject(REDIS_CONNECTION_TOKEN)
    readonly redis: Redis,
    @Inject(IDENTITY_SERVICE)
    private readonly identity: IIdentityService,
    @Inject(SERVICE_PROVIDER_SERVICE)
    private readonly serviceProviderService: IServiceProviderService,
    private readonly exceptionFilter: FcExceptionFilter,
  ) {
    this.logger.setContext(this.constructor.name);
    /**
     * Bind only once
     *
     * This methods is called recursivly via setTimeout
     * thus it needs to be bound to `this`.
     * We bind it once for all in constructor.
     *  - less overhead at each run
     *  - easier to unit test
     */
    this.scheduleConfigurationReload = this.scheduleConfigurationReload.bind(
      this,
    );
  }

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  async onModuleInit() {
    const { issuer, configuration } = await this.getConfig();
    this.logger.debug('Initializing oidc-provider');

    try {
      this.provider = new this.ProviderProxy(issuer, configuration);
      this.provider.proxy = true;
    } catch (error) {
      throw new OidcProviderInitialisationException(error);
    }

    this.logger.debug('Mouting oidc-provider middleware');
    try {
      this.httpAdapterHost.httpAdapter.use(this.provider.callback);
    } catch (error) {
      throw new OidcProviderBindingException(error);
    }

    this.catchErrorEvents();
    this.scheduleConfigurationReload();
  }

  /**
   * @TODO return keys from HSM (how?)
   */
  async wellKnownKeys() {
    const config = this.config.get<OidcProviderConfig>('OidcProvider');

    return { keys: [JWK.asKey(config.sigHsmPubKey).toJWK()] };
  }

  /**
   * Scheduled reload of oidc-provider configuration
   */
  private async scheduleConfigurationReload(): Promise<void> {
    const configuration = await this.getConfig();
    this.logger.debug(
      `Reload configuration (reloadConfigDelayInMs:${configuration.reloadConfigDelayInMs})`,
    );

    this.overrideConfiguration(configuration);

    // Schedule next call, N seconds after END of this one
    setTimeout(
      this.scheduleConfigurationReload,
      configuration.reloadConfigDelayInMs,
    );
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
   * @param req
   * @param res
   */
  async finishInteraction(req, res, result) {
    try {
      return await this.provider.interactionFinished(req, res, result);
    } catch (error) {
      throw new OidcProviderRuntimeException(error);
    }
  }

  decodeAuthorizationHeader(authorizationHeader: string): string {
    const clientId = '';
    if (authorizationHeader) {
      if (authorizationHeader.split(' ').length === 2) {
        const base64ToUtf8 = Buffer.from(
          authorizationHeader.split(' ')[1],
          'base64',
        ).toString('utf8');
        if (base64ToUtf8.split(':').length === 2) {
          return base64ToUtf8.split(':')[0];
        }
      }
    }
    return clientId;
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
    pattern: OidcProviderMiddlewarePattern,
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
      if (step === OidcProviderMiddlewareStep.AFTER && route === pattern) {
        await middleware(ctx);
      }
    });
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

    errorEvents.forEach(eventName => {
      this.registerEvent(eventName, this.triggerError.bind(this, eventName));
    });
  }

  private triggerError(eventName: OidcProviderEvents, ctx, error: Error) {
    let wrappedError: FcException;
    if (error instanceof FcException) {
      wrappedError = error;
    } else {
      wrappedError = new OidcProviderRuntimeException(
        error,
        ErrorCode[eventName.toUpperCase()],
      );
    }

    this.throwError(ctx, wrappedError);
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

  /** @TODO Actually retrieve data from database
   * This should be done by an injected external service
   * exposing a `findAccount` method.
   *
   * Returned object should contains an `accountId` property
   * and an async `claims` function.
   * More documentation can be found in oidc-provider repo.
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#accounts
   */
  private async findAccount(ctx, sub: string) {
    this.logger.debug('OidcProviderService.findAccount()');

    try {
      const { identity } = await this.identity.getSpIdentity(sub);

      return {
        accountId: sub,
        async claims() {
          return identity;
        },
      };
    } catch (error) {
      // Hacky throw from oidc-provider
      this.throwError(ctx, error);
    }
  }

  /**
   *
   * @param ctx Koa's `ctx` object
   * @param out output body, we won't use it here.
   * @param error error trown from oidc-provider
   *
   * @see https://github.com/panva/node-oidc-provider/tree/master/docs#rendererror
   */
  private renderError(ctx: KoaContextWithOIDC, _out: string, error: any) {
    // Instantiate our exception
    const exception = new OidcProviderRuntimeException(
      error,
      ErrorCode.RUNTIME,
    );
    // Call our hacky "thrower"
    this.throwError(ctx, exception);
  }

  /**
   * More documentation can be found in oidc-provider repo
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#logoutsource
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
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables)
   *  - database (SP configuration)
   */
  private async getConfig(): Promise<OidcProviderConfig> {
    /**
     * Get SP's information from provided serviceProviderService
     */
    const clients = await this.serviceProviderService.getList();

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
      issuer,
      sigHsmPubKey,
      configuration,
      reloadConfigDelayInMs,
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    /**
     * Build final configuration object
     */
    return {
      reloadConfigDelayInMs,
      issuer,
      sigHsmPubKey,
      configuration: {
        ...configuration,
        adapter,
        clients,
        findAccount: this.findAccount.bind(this),
        renderError: this.renderError.bind(this),
        logoutSource: this.logoutSource.bind(this),
      },
    };
  }
}
