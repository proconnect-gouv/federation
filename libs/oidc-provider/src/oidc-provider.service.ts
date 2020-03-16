import { HttpAdapterHost } from '@nestjs/core';
import { Inject, Injectable } from '@nestjs/common';
import { Provider } from 'oidc-provider';
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

    this.provider = new Provider(issuer, configuration);

    this.logger.debug('Mouting oidc-provider middleware');
    this.httpAdapterHost.httpAdapter.use(this.provider.callback);

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
      },
    };
  }
}
