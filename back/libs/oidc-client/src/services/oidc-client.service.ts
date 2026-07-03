import { ConfigService } from "@fc/config";
import { LoggerService } from "@fc/logger";
import { HttpProxyProtocol } from "@fc/microservices";
import { IdentityProviderMetadata } from "@fc/oidc";
import { IDENTITY_PROVIDER_SERVICE } from "@fc/oidc-client/tokens";
import { RabbitmqConfig } from "@fc/rabbitmq";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request } from "express";
import { chain, cloneDeep, isObject, map } from "lodash";
import {
  authorizationCodeGrant,
  AuthorizationResponseError,
  buildAuthorizationUrl,
  buildEndSessionUrl,
  ClientSecretPost,
  Configuration,
  customFetch,
  discovery,
  fetchUserInfo,
  IDToken,
  randomNonce,
  randomState,
  TokenEndpointResponse,
  TokenEndpointResponseHelpers,
  type UserInfoResponse,
} from "openid-client";
import { lastValueFrom, timeout } from "rxjs";

import {
  HyyyperbridgeEnveloppeDto,
  HyyyperbridgeErrorDto,
  HyyyperbridgeMessageType,
  HyyyperbridgeResponseDto,
} from "@fc/hyyyperbridge";
import { AcrClaims } from "@fc/oidc-acr";
import { OidcProviderConfig } from "@fc/oidc-provider";
import { SessionService } from "@fc/session";
import { OidcClientConfig, TokenDto } from "../dto";
import {
  AuthorizationResponseErrorException,
  HyyyperbridgeCsmrException,
  HyyyperbridgeMissingVariableException,
  HyyyperbridgeRabbitmqException,
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
  OidcClientIssuerDiscoveryFailedException,
  OidcClientTokenFailedException,
  OidcClientTokenValidationFailedException,
  OidcClientUserinfoFailedException,
} from "../exceptions";
import {
  OidcClientSessionParams,
  type IIdentityProviderAdapter,
} from "../interfaces";

@Injectable()
export class OidcClientService {
  SCOPES = [
    "openid",
    "uid",
    "given_name",
    "usual_name",
    "email",
    "siren",
    "siret",
    "organizational_unit",
    "belonging_population",
    "phone",
    "chorusdt",
  ].join(" ");

  entraIdAcrValuesMapping = {
    c1: "eidas1",
    c2: "eidas2",
    c3: "eidas3",
  };

  prioritizedAcrValues = ["eidas3", "eidas2", "eidas1"];

  constructor(
    private readonly config: ConfigService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderAdapter,
    private readonly logger: LoggerService,
    @Inject("HyyyperbridgeBroker") private readonly broker: ClientProxy,
    private readonly session: SessionService,
  ) {}

  static objToUrlParams(obj) {
    return new URLSearchParams(
      chain(obj)
        .omitBy((v) => v === undefined || v === null || v === "")
        .mapValues((o) => (isObject(o) ? JSON.stringify(o) : o))
        .value(),
    );
  }

  static getCurrentUrl = (req) =>
    new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);

  private async fetchThroughTheHyyyperbridge(
    url: string | URL | globalThis.Request,
    options?: RequestInit,
  ): Promise<Response> {
    const message = {
      url,
      headers: options.headers,
      method: options.method,
      data: options?.body?.toString(),
    };

    const { requestTimeout } = this.config.get<RabbitmqConfig>(
      "HyyyperbridgeBroker",
    );

    const order = this.broker
      .send(HttpProxyProtocol.Commands.HTTP_PROXY, message)
      .pipe(timeout(requestTimeout));

    let rawHyyyperbridgeEnveloppe: object;

    try {
      rawHyyyperbridgeEnveloppe = await lastValueFrom(order);
    } catch (error) {
      throw new HyyyperbridgeRabbitmqException(error);
    }

    const hyyyperbridgeEnveloppe = plainToInstance<
      HyyyperbridgeEnveloppeDto,
      object
    >(HyyyperbridgeEnveloppeDto, rawHyyyperbridgeEnveloppe);

    const hybridgeEnveloppeValidationErrors = await validate(
      hyyyperbridgeEnveloppe,
    );

    if (hybridgeEnveloppeValidationErrors.length) {
      throw new HyyyperbridgeMissingVariableException();
    }

    const { type, data: rawHyyyperbridgeData } = hyyyperbridgeEnveloppe;

    if (type === HyyyperbridgeMessageType.DATA) {
      const hyyyperbridgeResponse = plainToInstance(
        HyyyperbridgeResponseDto,
        rawHyyyperbridgeData,
      );
      const dtoProtocolErrors = await validate(hyyyperbridgeResponse);
      if (dtoProtocolErrors.length) {
        throw new HyyyperbridgeMissingVariableException();
      }

      const { headers, status, statusText } = hyyyperbridgeResponse;

      return new Response(hyyyperbridgeResponse.data, {
        status,
        headers,
        statusText,
      });
    } else {
      const hyyyperbridgeError = plainToInstance(
        HyyyperbridgeErrorDto,
        rawHyyyperbridgeData,
      );
      const hyyyperbridgeErrorValidationErrors =
        await validate(hyyyperbridgeError);
      if (hyyyperbridgeErrorValidationErrors.length) {
        throw new HyyyperbridgeMissingVariableException();
      }

      throw new HyyyperbridgeCsmrException().from(rawHyyyperbridgeData);
    }
  }

  /* istanbul ignore next */
  async fetch(
    useTheHyyyperbridge: boolean,
    url: string | URL | globalThis.Request,
    options?: RequestInit,
  ): Promise<Response> {
    // The Hybridge reverse proxy generates an error when both "Content-Length"
    // and "Transfer-Encoding" headers are sent simultaneously, which prevents
    // successful discovery:
    //
    // [error] 21#21: *1 upstream sent "Content-Length" and "Transfer-Encoding" headers at the same time while reading response header from upstream, client: 172.16.1.3, server: _, request: "GET /.well-known/openid-configuration HTTP/1.1", upstream: "https://172.16.1.4:3000/.well-known/openid-configuration", host: "fia-rie-low.docker.dev-franceconnect.fr"
    //
    // The key difference between the new openid-client and v5 is the accept-encoding
    // header value: 'br, gzip, deflate' in the new client versus 'identity' in v5.
    // We set accept-encoding to 'identity' to prevent breaking things for this upgrade.
    const updatedOptions = {
      ...options,
      headers: {
        ...options.headers,
        "accept-encoding": "identity",
      },
    };

    if (useTheHyyyperbridge) {
      return this.fetchThroughTheHyyyperbridge(url, updatedOptions);
    }

    return fetch(url, updatedOptions);
  }

  private getOidcClientErrorParams(): OidcClientSessionParams {
    const spName = this.session.get("User", "spName");
    const idpLoginHint = this.session.get("User", "idpLoginHint");

    return {
      spName,
      idpLoginHint,
    };
  }

  public async getProviderConfig(issuerId: string): Promise<{
    config: Configuration;
    idp: IdentityProviderMetadata;
  }> {
    const { timeout, enableHyyyperbridge } =
      this.config.get<OidcClientConfig>("OidcClient");
    const idp = await this.identityProvider.getById(issuerId);

    if (!idp) {
      const errorParams = this.getOidcClientErrorParams();
      throw new OidcClientIdpNotFoundException(errorParams);
    }

    if (!idp.active) {
      throw new OidcClientIdpDisabledException({
        contactEmail: idp.supportEmail,
      });
    }

    let config: Configuration;
    if (!idp.discovery) {
      config = new Configuration(
        idp.federationServerMetadata,
        idp.federationClientMetadata.client_id,
        idp.federationClientMetadata,
        ClientSecretPost(idp.federationClientMetadata.client_secret),
      );
      config[customFetch] = this.fetch.bind(
        this,
        enableHyyyperbridge && idp.useTheHyyyperbridge,
      );
    } else {
      try {
        config = await discovery(
          new URL(idp.discoveryUrl),
          idp.federationClientMetadata.client_id,
          idp.federationClientMetadata,
          ClientSecretPost(idp.federationClientMetadata.client_secret),
          {
            timeout,
            [customFetch]: this.fetch.bind(
              this,
              enableHyyyperbridge && idp.useTheHyyyperbridge,
            ),
          },
        );
      } catch (error) {
        if (error.cause instanceof Response) {
          /* istanbul ignore next */
          const body = await error.cause.text().catch(() => "unreadable body");
          this.logger.error({
            code: "oidc-client-discovery-http-error",
            reponseError: {
              status: error.cause.status,
              statusText: error.cause.statusText,
              headers: Object.fromEntries(error.cause.headers?.entries()),
              url: error.cause.url,
              body,
            },
          });
        }
        const errorParams = this.getOidcClientErrorParams();
        throw new OidcClientIssuerDiscoveryFailedException(
          { ...errorParams, contactEmail: idp.supportEmail, idpName: idp.name },
          error,
        );
      }
    }

    return { config, idp };
  }

  async getAuthorizationUrl(
    idpId: string,
    customParams: { [key: string]: any },
  ): Promise<{
    authorizationUrl: string;
    nonce: string;
    state: string;
    idpName: string;
    idpLabel: string;
  }> {
    const { config, idp } = await this.getProviderConfig(idpId);
    const nonce = randomNonce();
    const state = randomState();
    const { redirectUri: redirect_uri } =
      this.config.get<OidcClientConfig>("OidcClient");

    const defaultParams: { [key: string]: any } = {
      scope: this.SCOPES,
      nonce,
      state,
      redirect_uri,
    };

    const params = {
      ...defaultParams,
      ...customParams,
    };

    if (!idp.isMfaCompliant && params.claims?.id_token?.acr) {
      params.claims = this.filterOutMfaAcrValuesFromClaims(params.claims);
    }

    if (idp.isEntraID) {
      params.scope = "openid email profile";
      delete params.claims;
    }

    const authorizationUrl = buildAuthorizationUrl(
      config,
      OidcClientService.objToUrlParams(params),
    ).toString();

    return {
      authorizationUrl,
      nonce,
      state,
      idpName: idp.name,
      idpLabel: idp.title,
    };
  }

  async getToken({
    idpId,
    req,
    idpState,
    idpNonce,
    spId,
    spName,
  }: {
    idpId: string;
    req: Request;
    idpState: string;
    idpNonce: string;
    spId: string;
    spName: string;
  }) {
    const { config, idp } = await this.getProviderConfig(idpId);

    let tokens: TokenEndpointResponse & TokenEndpointResponseHelpers;

    try {
      tokens = await authorizationCodeGrant(
        config,
        OidcClientService.getCurrentUrl(req),
        {
          expectedNonce: idpNonce,
          expectedState: idpState,
        },
        // These parameters are used by Cerbère
        { sp_id: spId, sp_name: spName },
      );
    } catch (error) {
      if (error.cause instanceof Response) {
        /* istanbul ignore next */
        const body = await error.cause.text().catch(() => "unreadable body");
        this.logger.error({
          code: "oidc-client-token-http-error",
          reponseError: {
            status: error.cause.status,
            statusText: error.cause.statusText,
            headers: Object.fromEntries(error.cause.headers?.entries()),
            url: error.cause.url,
            body,
          },
        });
      }
      if (error instanceof AuthorizationResponseError) {
        let errorMessage = error.error;
        if (error.error_description) {
          errorMessage += ` (${error.error_description})`;
        }
        throw new AuthorizationResponseErrorException(
          { contactEmail: idp.supportEmail, idpName: idp.name },
          errorMessage,
        );
      }

      throw new OidcClientTokenFailedException(
        { contactEmail: idp.supportEmail, idpName: idp.name },
        error,
      );
    }

    const claims = tokens.claims();

    this.logger.info({
      code: `oidc-client-info:get-token`,
      claims: cloneDeep(claims),
    });

    const { access_token: accessToken, id_token: idToken } = tokens;

    const token = plainToInstance(TokenDto, {
      accessToken,
      idToken,
      claims,
    });
    const tokenValidationErrors = await validate(token as object);

    if (tokenValidationErrors.length) {
      throw new OidcClientTokenValidationFailedException(
        { contactEmail: idp.supportEmail, idpName: idp.name },
        tokenValidationErrors.toString(),
      );
    }

    let acr = token.claims.acr || "eidas1";

    if (idp.isEntraID && claims.acrs) {
      // This behavior is specific to MS Entra ID's authentication contexts
      // We consider only values of the form c1, c2, c3, mutually exclusive,
      // and map them to equivalent eidas levels
      const proConnectAcrs = map(
        token.claims.acrs,
        (level) => this.entraIdAcrValuesMapping[level],
      ).filter(Boolean);
      const proConnectHighestAcr = this.prioritizedAcrValues.find((level) =>
        proConnectAcrs.includes(level),
      );
      if (!!proConnectHighestAcr) {
        acr = proConnectHighestAcr;
      }
    }

    token.claims.acr = acr;

    return token;
  }

  async getUserinfo({
    idpId,
    accessToken,
    claims,
  }: {
    idpId: string;
    accessToken: string;
    claims: IDToken;
  }) {
    const { config, idp } = await this.getProviderConfig(idpId);

    let plainIdpIdentity: UserInfoResponse;

    try {
      plainIdpIdentity = await fetchUserInfo(config, accessToken, claims.sub);

      this.logger.info({
        code: `oidc-client-info:get-userinfo`,
        plainIdpIdentity: cloneDeep(plainIdpIdentity),
      });

      if (idp.isEntraID) {
        for (const key of this.SCOPES.split(" ")) {
          if (claims[key] && !plainIdpIdentity[key]) {
            // @ts-ignore Index signature in type UserInfoResponse only permits reading.
            plainIdpIdentity[key] = claims[key];
          }
        }
      }

      return plainIdpIdentity;
    } catch (error) {
      if (error.cause instanceof Response) {
        /* istanbul ignore next */
        const body = await error.cause.text().catch(() => "unreadable body");
        this.logger.error({
          code: "oidc-client-userinfo-http-error",
          reponseError: {
            status: error.cause.status,
            statusText: error.cause.statusText,
            headers: Object.fromEntries(error.cause.headers?.entries()),
            url: error.cause.url,
            body,
          },
        });
      }
      throw new OidcClientUserinfoFailedException(
        { contactEmail: idp.supportEmail, idpName: idp.name },
        error,
      );
    }
  }

  private filterOutMfaAcrValuesFromClaims(previousClaims: {
    id_token: { acr: AcrClaims };
  }) {
    const nextClaims = cloneDeep(previousClaims);

    const requestedAcrValues = nextClaims.id_token.acr.value
      ? [nextClaims.id_token.acr.value]
      : [...nextClaims.id_token.acr.values!];
    const { acrValuesForMfa } =
      this.config.get<OidcProviderConfig>("OidcProvider");

    const nonMfaAcrValues = requestedAcrValues.filter(
      (acrValue) => !acrValuesForMfa.includes(acrValue),
    );

    if (nonMfaAcrValues.length === 0 && nextClaims.id_token.acr.essential) {
      delete nextClaims.id_token.acr;
      return nextClaims;
    }
    nextClaims.id_token.acr = {
      ...nextClaims.id_token.acr,
      values: nonMfaAcrValues,
    };
    return nextClaims;
  }

  async getEndSessionUrl({
    idpId,
    idTokenHint,
  }: {
    idpId: string;
    idTokenHint?: string;
  }) {
    const { config } = await this.getProviderConfig(idpId);
    const { postLogoutRedirectUri: post_logout_redirect_uri } =
      this.config.get<OidcClientConfig>("OidcClient");

    try {
      const endSessionUrl = buildEndSessionUrl(
        config,
        OidcClientService.objToUrlParams({
          id_token_hint: idTokenHint,
          post_logout_redirect_uri,
        }),
      ).toString();

      /**
       * Temporary remove client_id from endSessionUrl since parameter was not provided in previous version of openid-client
       * This might break the logout with our Idps
       * @todo #1449 Enable client_id in endSessionUrl
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1449
       */
      const temporaryWorkAroundUrl = endSessionUrl.replace(
        /(&|\?)client_id=[^&]+/,
        "",
      );

      return temporaryWorkAroundUrl;
    } catch (error) {
      this.logger.warn({
        code: `get-end-session-url-failed`,
        originalError: error,
      });

      return null;
    }
  }
}
