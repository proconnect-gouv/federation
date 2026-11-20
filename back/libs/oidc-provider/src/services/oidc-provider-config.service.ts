import { ConfigService } from "#libs/config";
import { ErrorPageParams } from "#libs/exceptions/types/error-page-params";
import { LoggerService } from "#libs/logger";
import {
  type IServiceProviderAdapter,
  SERVICE_PROVIDER_SERVICE_TOKEN,
} from "#libs/oidc";
import { SessionConfig, SessionService } from "#libs/session";
import { Inject, Injectable } from "@nestjs/common";
import { Response } from "express";
import { Configuration, KoaContextWithOIDC } from "oidc-provider";
import { v4 as uuid } from "uuid";
import { OidcProviderRedisAdapter } from "../adapters";
import { OidcProviderConfig } from "../dto";
import { OidcProviderService } from "../oidc-provider.service";
import { OidcProviderGrantIdentityService } from "./oidc-provider-grant-identity.service";

@Injectable()
export class OidcProviderConfigService {
  constructor(
    private readonly config: ConfigService,
    protected readonly logger: LoggerService,
    @Inject(SERVICE_PROVIDER_SERVICE_TOKEN)
    private readonly serviceProvider: IServiceProviderAdapter,
    protected readonly sessionService: SessionService,
    private readonly grantIdentity: OidcProviderGrantIdentityService,
  ) {}

  /**
   * Compose full config by merging static parameters from:
   *  - configuration file (some may be coming from environment variables).
   *  - database (SP configuration).
   *
   * @returns {OidcProviderConfig}
   */
  /* istanbul ignore next */
  getConfig(oidcProviderService: OidcProviderService): {
    issuer: string;
    configuration: Configuration;
  } {
    /**
     * Build our memory adapter for oidc-provider
     * @see https://github.com/panva/node-oidc-provider/tree/master/docs#adapter
     *
     * We can't use nest DI for our adapter.
     * `oidc-provider` wants a class and instantiate the adapter on its own.
     * @see https://github.com/panva/node-oidc-provider/blob/9306f66bdbcdff01400773f26539cf35951b9ce8/lib/models/client.js#L201
     * @see https://github.com/panva/node-oidc-provider/blob/22cc547ffb45503cf2fc4357958325e0f5ed4b2f/lib/models/base_model.js#L28
     *
     * So we cannot directly use NestJs DI to instantiate the adapter.
     *
     * The trick here is simple :
     * 1. We inject necessary services in this service (oidcProviderService)
     * 2. We bind them to our adapter constructor.
     * 3. We give the resulting constructor to `oidc-provider`
     *
     * NB: If we want to add more services to the adapter,
     * we need to add them to constructor and to pass them along here.
     */
    const adapter = OidcProviderRedisAdapter.getConstructorWithDI(
      oidcProviderService,
      this.serviceProvider,
    );

    const {
      prefix,
      issuer,
      routes,
      cookies,
      jwks,
      timeout,
      supportedAcrValues,
    } = this.config.get<OidcProviderConfig>("OidcProvider");
    const { lifetime: sessionLifetime } =
      this.config.get<SessionConfig>("Session");

    const url = this.url.bind(this, prefix);

    const configuration: Configuration = {
      acrValues: supportedAcrValues,
      adapter,
      claims: {
        amr: ["amr"],
        uid: ["uid"],
        openid: ["sub"],
        given_name: ["given_name"],
        email: ["email"],
        phone: ["phone_number"],
        organizational_unit: ["organizational_unit"],
        siren: ["siren"],
        siret: ["siret"],
        usual_name: ["usual_name"],
        belonging_population: ["belonging_population"],
        chorusdt: ["chorusdt:matricule", "chorusdt:societe"],
        idp_id: ["idp_id"],
        idp_acr: ["idp_acr"],
        roles: ["roles"],
        organization_label: ["organization_label"],
        groups: ["groups"],
        custom: ["custom"],

        lasuite_visio: ["lasuite_visio"],
        "lasuite_visio:rooms:create": ["lasuite_visio:rooms:create"],
        "lasuite_visio:rooms:list": ["lasuite_visio:rooms:list"],
        "lasuite_visio:rooms:retrieve": ["lasuite_visio:rooms:retrieve"],
        "lasuite_visio:rooms:update": ["lasuite_visio:rooms:update"],
        "lasuite_visio:rooms:delete": ["lasuite_visio:rooms:delete"],
      },
      clientBasedCORS: () => false,
      clientDefaults: {
        grant_types: ["authorization_code", "refresh_token"],
        id_token_signed_response_alg: "ES256",
        response_types: ["code"],
        token_endpoint_auth_method: "client_secret_post",
        application_type: "web",
      },
      cookies,
      enabledJWA: {
        authorizationEncryptionAlgValues: ["ECDH-ES", "RSA-OAEP"],
        authorizationEncryptionEncValues: ["A256GCM"],
        authorizationSigningAlgValues: ["ES256", "RS256", "HS256"],
        dPoPSigningAlgValues: ["ES256", "RS256"],
        idTokenEncryptionAlgValues: ["ECDH-ES", "RSA-OAEP"],
        idTokenEncryptionEncValues: ["A256GCM"],
        idTokenSigningAlgValues: ["ES256", "RS256", "HS256"],
        introspectionEncryptionAlgValues: ["ECDH-ES", "RSA-OAEP"],
        introspectionEncryptionEncValues: ["A256GCM"],
        introspectionSigningAlgValues: ["ES256", "RS256", "HS256"],
        requestObjectEncryptionAlgValues: ["ECDH-ES", "RSA-OAEP"],
        requestObjectEncryptionEncValues: ["A256GCM"],
        requestObjectSigningAlgValues: ["ES256", "RS256", "HS256"],
        clientAuthSigningAlgValues: ["ES256", "RS256"],
        userinfoEncryptionAlgValues: ["ECDH-ES", "RSA-OAEP"],
        userinfoEncryptionEncValues: ["A256GCM"],
        userinfoSigningAlgValues: ["ES256", "RS256", "HS256"],
      },
      extraParams: ["idp_hint", "siret_hint"],
      features: {
        devInteractions: { enabled: false },
        encryption: { enabled: true },
        introspection: { enabled: true },
        jwtUserinfo: { enabled: true },
        jwtIntrospection: { enabled: true },
        backchannelLogout: { enabled: false },
        pushedAuthorizationRequests: { enabled: false },
        revocation: { enabled: true },
        rpInitiatedLogout: {
          enabled: true,
          logoutSource: this.logoutSource,
          postLogoutSuccessSource: this.postLogoutSuccessSource,
        },
        claimsParameter: { enabled: true },
        resourceIndicators: { enabled: false },
        requestObjects: { requestUri: true },
      },
      findAccount: this.findAccount,
      httpOptions: (_url) => ({ signal: AbortSignal.timeout(timeout) }),
      interactions: { url },
      issueRefreshToken: () => true,
      jwks,
      pkce: {
        methods: ["S256"],
        required: () => false,
      },
      renderError: this.renderError,
      responseTypes: ["code"],
      routes,
      scopes: ["openid"],
      subjectTypes: ["public"],
      clientAuthMethods: ["client_secret_post", "private_key_jwt"],
      ttl: {
        // default values can be found in the documentation
        // https://github.com/panva/node-oidc-provider/blob/v8.x/docs/README.md#ttl
        AuthorizationCode: 600, // 10 minute in seconds
        // A grant lives one Grant TTL after its interaction: it is never
        // extended, and its identity record has the same TTL.
        // see OidcProviderService.finishInteraction
        Grant: sessionLifetime,
        Session: sessionLifetime,
        RefreshToken: function RefreshTokenTTL(ctx, token, client) {
          if (
            ctx &&
            ctx.oidc.entities.RotatedRefreshToken &&
            client.applicationType === "web" &&
            client.clientAuthMethod === "none" &&
            !token.isSenderConstrained()
          ) {
            // Non-Sender Constrained SPA RefreshTokens do not have infinite expiration through rotation
            return ctx.oidc.entities.RotatedRefreshToken.remainingTTL;
          }

          return sessionLifetime;
        },
      },
    };

    return { issuer, configuration };
  }

  private url(prefix: string, _ctx: KoaContextWithOIDC, interaction: any) {
    return `${prefix}/interaction/${interaction.uid}`;
  }

  logoutSource: Configuration["features"]["rpInitiatedLogout"]["logoutSource"] =
    (ctx, form) => {
      ctx.body = `<!DOCTYPE html>
        <head>
          <title>Déconnexion</title>
        </head>
        <body>
          ${form}
          <script src="/js/end-session-confirm.js"></script>
        </body>
      </html>`;
    };

  postLogoutSuccessSource: Configuration["features"]["rpInitiatedLogout"]["postLogoutSuccessSource"] =
    (ctx) => {
      // This line magically avoids error 500: ERR_HTTP_HEADERS_SENT
      // TODO investigate why.
      ctx.body = "";

      const res = ctx.res as unknown as Response;
      ctx.type = "html";
      // the render function is magically available in the koa context
      // as oidc-provider servers is mounted behind the nest server.
      const errorPageParams: ErrorPageParams = {
        exceptionDisplay: {
          title: "Déconnexion",
          description:
            "Vous êtes bien déconnecté, vous pouvez fermer votre navigateur.",
          illustration: "connexion",
        },
        error: {},
      };
      ctx.body = res.render("error", errorPageParams);
    };

  findAccount: Configuration["findAccount"] = async (_ctx, sub, token) => {
    if (!token) {
      // /authorize: claims() is not called there (responseTypes: ["code"]).
      return {
        accountId: sub,
        async claims() {
          return { sub };
        },
      };
    }

    // /token and /userinfo are called by the SP, without the browser session:
    // read the identity of the login that issued the token.
    const grantIdentity = await this.grantIdentity.find(token.grantId, sub);

    if (!grantIdentity) {
      return undefined;
    }

    const { spIdentity } = grantIdentity;

    return {
      accountId: sub,

      async claims() {
        return { ...spIdentity };
      },
    };
  };

  renderError: Configuration["renderError"] = (
    ctx: KoaContextWithOIDC,
    { error, error_description },
    err,
  ) => {
    const code = `oidc-provider-rendered-error:${error}`;
    const id = uuid();
    const message = error_description;

    this.logger.error({ code, id, message, originalError: err });

    const res = ctx.res as unknown as Response;
    ctx.type = "html";
    // the render function is magically available in the koa context
    // as oidc-provider servers is mounted behind the nest server.
    const errorPageParams: ErrorPageParams = {
      exceptionDisplay: {},
      error: { code, id, message },
    };
    ctx.body = res.render("error", errorPageParams);
  };
}
