import { HttpAdapterHost } from '@nestjs/core';
import { ArgumentsHost, Inject, Injectable } from '@nestjs/common';
import { Provider, KoaContextWithOIDC } from 'oidc-provider';
import { FcExceptionFilter } from '@fc/error';
import {
  OidcProviderInitialisationException,
  OidcProviderRuntimeException,
  OidcProviderBindingException,
} from './exceptions';

/**
 * We sadly need `lodash` to override node-oid-provider
 * configuration function that relies on it.
 * @see OidcProviderService.overrideConfiguration()
 */
import { get } from 'lodash';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { IIdentityManagementService, ISpManagementService } from './interfaces';
import { IDENTITY_MANAGEMENT_SERVICE, SP_MANAGEMENT_SERVICE } from './tokens';
import { oidcProviderHooks, oidcProviderEvents } from './enums';
import { OidcProviderConfig } from './dto';

@Injectable()
export class OidcProviderService {
  private provider: Provider;

  constructor(
    private httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    @Inject(IDENTITY_MANAGEMENT_SERVICE)
    private readonly identityManagementService: IIdentityManagementService,
    @Inject(SP_MANAGEMENT_SERVICE)
    private readonly spManagementService: ISpManagementService,
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
      this.provider = new Provider(issuer, configuration);
    } catch (error) {
      throw new OidcProviderInitialisationException(error);
    }

    this.logger.debug('Mouting oidc-provider middleware');
    try {
      this.httpAdapterHost.httpAdapter.use(this.provider.callback);
    } catch (error) {
      throw new OidcProviderBindingException(error);
    }

    this.scheduleConfigurationReload();
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

  getProvider(): Provider {
    return this.provider;
  }

  /**
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#pre--and-post-middlewares
   */
  hook(
    step: oidcProviderHooks,
    eventName: oidcProviderEvents,
    hookFunction: Function,
  ): void {
    this.provider.use(async (ctx: any, next: Function) => {
      if (step === oidcProviderHooks.BEFORE && ctx.path === eventName) {
        await hookFunction(ctx);
      }

      await next();

      if (
        step === oidcProviderHooks.AFTER &&
        ctx.oidc &&
        ctx.oidc.route === eventName
      ) {
        await hookFunction(ctx);
      }
    });
  }

  /** @TODO Actually retrieve data from database
   * This should be done by an injected external service
   * exposing a `findAccount` method
   *
   * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#accounts
   */
  private async findAccount(ctx, sub: string) {
    this.logger.debug('OidcProviderService.findAccount()');

    const identity = await this.identityManagementService.getIdentity(sub);

    return {
      accountId: sub,
      async claims() {
        return identity;
      },
    };
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
   *
   * @param ctx Koa's `ctx` object
   * @param out output body, we won't use it here.
   * @param error error trown from oidc-provider
   *
   * @see https://github.com/panva/node-oidc-provider/tree/master/docs#rendererror
   */
  private renderError(ctx: KoaContextWithOIDC, _out: string, error: any) {
    // Instantiate our exception
    const exception = new OidcProviderRuntimeException(error);

    // Build fake ArgumentsHost host instance
    const host = FcExceptionFilter.ArgumentHostAdapter(ctx) as ArgumentsHost;

    // Finally call the exception filter
    this.exceptionFilter.catch(exception, host);
  }

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables)
   *  - database (SP configuration)
   */
  private async getConfig(): Promise<OidcProviderConfig> {
    const clients = await this.spManagementService.getList();
    const {
      issuer,
      configuration,
      reloadConfigDelayInMs,
    } = this.configService.get<OidcProviderConfig>('OidcProvider');

    return {
      reloadConfigDelayInMs,
      issuer,
      configuration: {
        ...configuration,
        clients,
        findAccount: this.findAccount.bind(this),
        renderError: this.renderError.bind(this),
      },
    };
  }
}
