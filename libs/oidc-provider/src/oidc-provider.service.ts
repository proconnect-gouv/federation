/* Temporay hard coded oidc-prodider config. 
   Remove eslint-disable once config is implemented */
/* eslint-disable @typescript-eslint/camelcase */
import { HttpAdapterHost } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { Provider } from 'oidc-provider';
import { oidcProviderHooks, oidcProviderEvents } from './enums';

@Injectable()
export class OidcProviderService {
  private readonly provider: Provider;

  constructor(private httpAdapterHost: HttpAdapterHost) {
    const { issuer, configuration } = this.getConfig();
    console.log('Initializing oidc-provider');
    this.provider = new Provider(issuer, configuration);
  }

  /**
   * Wait for nest to load its own route before binding oidc-provider routes
   * @see https://docs.nestjs.com/faq/http-adapter
   * @see https://docs.nestjs.com/fundamentals/lifecycle-events
   */
  onModuleInit() {
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

  private getConfig() {
    return {
      issuer: 'http://localhost:3000',
      configuration: {
        // ... see the available options in Configuration options section
        grant_types_supported: ['authorization_code'],
        features: {
          introspection: { enabled: true },
          revocation: { enabled: true },
          devInteractions: { enabled: false },
        },
        cookies: {
          keys: ['foo'],
        },
        clients: [
          {
            client_id:
              'a0cd64372db6ecf39c317c0c74ce90f02d8ad7d510ce054883b759d666a996bc',
            client_secret:
              'a970fc88b3111fcfdce515c2ee03488d8a349e5379a3ba2aa48c225dcea243a5',
            redirect_uris: [
              'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
            ], // + other client properties
          },
        ],
        routes: {
          authorization: '/api/v2/authorize',
          interaction: '/interaction',
          end_session: '/user/session/end',
          revocation: '/user/token/revocation',
          token: '/api/v2/token',
          userinfo: '/api/v2/userinfo',
        },
        async findAccount(ctx, id) {
          console.log('OidcProviderService.getConfig().findAccount()');
          return {
            accountId: 'MyAccountId',
            async claims(use, scope) {
              return { sub: 'MySub' };
            },
          };
        },
      },
    };
  }
}
