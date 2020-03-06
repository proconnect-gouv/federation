/* Temporay hard coded oidc-prodider config. 
   Remove eslint-disable once config is implemented */
/* eslint-disable @typescript-eslint/camelcase */
import { HttpAdapterHost } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { Provider } from 'oidc-provider';
import { oidcProviderHooks, oidcProviderEvents } from './enums';
import { OidcProviderConfig } from './dto';

@Injectable()
export class OidcProviderService {
  private provider: Provider;

  constructor(
    private httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  async onModuleInit() {
    const { issuer, configuration } = await this.getConfig();
    console.log('Initializing oidc-provider');
    this.provider = new Provider(issuer, configuration);

    console.log('Mouting oidc-provider middleware');
    this.httpAdapterHost.httpAdapter.use(this.provider.callback);
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

  private async getClients() {
    return [
      {
        client_id:
          'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
        client_secret:
          'a970fc88b3111fcfdce515c2ee03488d8a349e5379a3ba2aa48c225dcea243a5',
        redirect_uris: [
          'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
        ], // + other client properties
      },
    ];
  }

  private findAccount(ctx, id) {
    console.log('OidcProviderService.getConfig().findAccount()');
    return {
      accountId: 'MyAccountId',
      async claims(use, scope) {
        return { sub: 'MySub' };
      },
    };
  }

  private async getConfig() {
    const clients = await this.getClients();
    const { issuer, configuration } = this.configService.get<
      OidcProviderConfig
    >('OidcProvider');

    return {
      issuer,
      configuration: {
        ...configuration,
        clients,
        findAccount: this.findAccount.bind(this),
      },
    };
  }
}
