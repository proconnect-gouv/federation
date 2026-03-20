import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request } from "express";
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

import { Inject, Injectable } from "@nestjs/common";

import { LoggerService } from "@fc/logger";

import { ConfigService } from "@fc/config";
import { AppConfig } from "@fc/core";
import { IdentityProviderMetadata } from "@fc/oidc";
import { IDENTITY_PROVIDER_SERVICE } from "@fc/oidc-client/tokens";
import { chain, cloneDeep, filter, isObject } from "lodash";
import { OidcClientConfig, TokenDto } from "../dto";
import {
  AuthorizationResponseErrorException,
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
  OidcClientIssuerDiscoveryFailedException,
  OidcClientTokenFailedException,
  OidcClientTokenValidationFailedException,
  OidcClientUserinfoFailedException,
} from "../exceptions";
import { type IIdentityProviderAdapter } from "../interfaces";

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

  constructor(
    private readonly config: ConfigService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderAdapter,
    private readonly logger: LoggerService,
  ) {}

  static objToUrlParams(obj) {
    return new URLSearchParams(
      chain(obj)
        .omitBy((v) => v === undefined || v === null || v === "")
        .mapValues((o) => (isObject(o) ? JSON.stringify(o) : o))
        .value(),
    );
  }

  /* istanbul ignore next */
  static fetch = async (url, options) => {
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

    return fetch(url, updatedOptions);
  };

  static getCurrentUrl = (req) =>
    new URL(`${req.protocol}://${req.get("host")}${req.originalUrl}`);

  public async getProviderConfig(issuerId: string): Promise<{
    config: Configuration;
    idp: IdentityProviderMetadata;
  }> {
    const { timeout } = this.config.get<OidcClientConfig>("OidcClient");
    const idp = await this.identityProvider.getById(issuerId);

    if (!idp) {
      throw new OidcClientIdpNotFoundException();
    }

    if (!idp.active) {
      throw new OidcClientIdpDisabledException(idp.supportEmail);
    }

    let config: Configuration;
    if (!idp.discovery) {
      config = new Configuration(
        idp.idpMetadata,
        idp.pcfClientMetadata.client_id,
        idp.pcfClientMetadata,
        ClientSecretPost(idp.pcfClientMetadata.client_secret),
      );
    } else {
      try {
        config = await discovery(
          new URL(idp.discoveryUrl),
          idp.pcfClientMetadata.client_id,
          idp.pcfClientMetadata,
          ClientSecretPost(idp.pcfClientMetadata.client_secret),
          {
            timeout,
            [customFetch]: OidcClientService.fetch,
          },
        );
      } catch (error) {
        throw new OidcClientIssuerDiscoveryFailedException(
          idp.supportEmail,
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

    const { defaultIdpId } = this.config.get<AppConfig>("App");
    // this specific behavior is a legacy implementation and should be homogenized in the future
    if (idpId === defaultIdpId) {
      params.scope += " is_service_public";
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
  }: {
    idpId: string;
    req: Request;
    idpState: string;
    idpNonce: string;
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
      );
    } catch (error) {
      if (error instanceof AuthorizationResponseError) {
        throw new AuthorizationResponseErrorException(
          idp.supportEmail,
          `${error.error} (${error.error_description})`,
        );
      }

      throw new OidcClientTokenFailedException(idp.supportEmail, error);
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
        idp.supportEmail,
        tokenValidationErrors.toString(),
      );
    }

    let acr = token.claims.acr || "eidas1";

    if (idp.isEntraID && claims.acrs) {
      // This behavior is specific to MS Entra ID's authentication contexts
      // We consider only values of the form c1, c2, c3, mutually exclusive,
      // and map them to equivalent eidas levels
      const acrs = filter(token.claims.acrs, (level) => level.startsWith("c"));
      acr = acrs.toString().replace("c", "eidas");
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
      throw new OidcClientUserinfoFailedException(idp.supportEmail, error);
    }
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
