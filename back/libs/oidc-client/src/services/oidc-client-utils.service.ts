/**
 * @TODO #1024 MAJ Jose version 3.X
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1024
 * @ticket #FC-1024
 */
import { isURL } from 'class-validator';
import { JWK } from 'jose-v2';
import {
  authorizationCodeGrant,
  buildEndSessionUrl,
  buildAuthorizationUrl,
  fetchUserInfo,
  refreshTokenGrant,
  tokenRevocation,
  ClientError,
  Configuration,
  TokenEndpointResponse,
  TokenEndpointResponseHelpers,
  skipSubjectCheck
} from 'openid-client-v6';

import { Inject, Injectable } from '@nestjs/common';

import { CryptographyService } from '@fc/cryptography';
import { FcException } from '@fc/exceptions';
import { LoggerService } from '@fc/logger';

import {
  OidcClientGetEndSessionUrlException,
  OidcClientIdpDisabledException,
  OidcClientIdpNotFoundException,
  OidcClientInvalidStateException,
  OidcClientMissingStateException,
  OidcClientTokenFailedException,
} from '../exceptions';
import {
  ExtraTokenParams,
  IIdentityProviderAdapter,
  TokenParams,
} from '../interfaces';
import { IDENTITY_PROVIDER_SERVICE } from '../tokens';
import { OidcClientConfigService } from './oidc-client-config.service';
import { OidcClientIssuerService } from './oidc-client-issuer.service';

@Injectable()
export class OidcClientUtilsService {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly logger: LoggerService,
    private readonly issuer: OidcClientIssuerService,
    private readonly oidcClientConfig: OidcClientConfigService,
    private readonly crypto: CryptographyService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderAdapter,
  ) {}

  async buildAuthorizeParameters() {
    const { stateLength } = await this.oidcClientConfig.get();
    const state = this.crypto.genRandomString(stateLength);
    /**
     * @TODO #430 specific parameter for nonce length (or rename mutual parameter)
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/430
     * choisir entre uid et getreandomstring
     */
    const nonce = this.crypto.genRandomString(stateLength);
    const params = {
      state,
      nonce,
    };

    return params;
  }

  async getAuthorizeUrl(
    idpId: string,
    authorizationParams: Record<string, any>,
  ): Promise<URL> {
    const client: Configuration = await this. issuer.getClient(idpId);

    return buildAuthorizationUrl(client, authorizationParams);
  }

  async wellKnownKeys() {
    const {
      jwks: { keys },
    } = await this.oidcClientConfig.get();

    /**
     * @TODO #427 Check why `JSONWebKeySet` entries are not compatible with `asKey` method
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/427
     * Maybe we don't need this convertion?
     */

    const publicKeys = keys.map((key) => JWK.asKey(key as any).toJWK());

    return { keys: publicKeys };
  }

  checkState(callbackParams, stateFromSession: string): void {
    if (!callbackParams.state) {
      throw new OidcClientMissingStateException();
    }

    if (callbackParams.state !== stateFromSession) {
      throw new OidcClientInvalidStateException();
    }
  }

  private extractParams(
    callbackParams: Record<string, any>,
    stateFromSession: string,
  ): any {
    this.checkState(callbackParams, stateFromSession);

    return callbackParams;
  }

  private buildExtraParameters(extraParams: ExtraTokenParams): Record<string,any> {
    if (extraParams) {
      return { exchangeBody: extraParams };
    }

    return {};
  }

  async getTokenSet(
    req,
    ipdId: string,
    params: TokenParams,
    extraParams?: ExtraTokenParams,
  ): Promise<TokenEndpointResponseHelpers & TokenEndpointResponse> {
    const client = await this.issuer.getClient(ipdId);
    const { state } = params;

    const callbackParams = req.query;
    const receivedParams = this.extractParams(callbackParams, state);

    let tokenSet: TokenEndpointResponseHelpers & TokenEndpointResponse;

    try {
      // Invoke `openid-client` handler
      tokenSet = await authorizationCodeGrant(
        client,
        new URL(req.protocol + '://' + req.get('host') + req.url),
        {
          expectedNonce: params.nonce,
          expectedState: params.state
        },
        this.buildExtraParameters(extraParams),
      );
    } catch (error) {
      if (error instanceof ClientError) {
        const exception = new FcException();
        exception.generic = true;
        exception.error = error.code;
        exception.error_description = error.message;
        exception.http_status_code = 400;
        throw exception;
      } else {
        this.logger.err(error.stack);
        this.logger.debug({
          client: { ...client, client_secret: '***' },
          receivedParams,
          params,
        });

        throw new OidcClientTokenFailedException();
      }
    }

    return tokenSet;
  }

  async revokeToken(accessToken: string, idpId: string): Promise<void> {
    const client = await this.issuer.getClient(idpId);

    await tokenRevocation(client, accessToken);
  }

  async getUserInfo<T>(accessToken: string, idpId: string): Promise<T> {
    const client = await this.issuer.getClient(idpId);

    const userInfo = await fetchUserInfo(client, accessToken, skipSubjectCheck) as T;

    return userInfo;
  }

  /**
   * Exchange a refresh token for a new token set.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.12.2
   *
   * @param {string} refreshToken A currently valid refresh token
   * @param {string} idpId The current idp id
   * @returns {Promise<TokenEndpointResponse & TokenEndpointResponseHelpers>} If successful, the token set from the refresh response
   */
  async refreshTokens(refreshToken: string, idpId: string): Promise<TokenEndpointResponse & TokenEndpointResponseHelpers> {
    const client = await this.issuer.getClient(idpId);

    const tokenSet = await refreshTokenGrant(client, refreshToken);

    return tokenSet;
  }

  /**
   * Build the endSessionUrl with given parameters.
   *
   * @param {string} idpId The current idp id
   * @param {string} stateFromSession The current state
   * @param {string} idTokenHint The last idToken retrieved
   * @param {string} postLogoutRedirectUri The url to redirect after logout
   * @returns {Promise<string>} The endSessionUrl with all parameters (state, postLogoutRedirectUri, ...)
   */
  async getEndSessionUrl(
    idpId: string,
    stateFromSession: string,
    idTokenHint?: string,
    postLogoutRedirectUri?: string,
  ): Promise<string> {
    const client = await this.issuer.getClient(idpId);

    let endSessionUrl;

    try {
      endSessionUrl = buildEndSessionUrl(client, {
        id_token_hint: idTokenHint,
        post_logout_redirect_uri: postLogoutRedirectUri,
        state: stateFromSession,
      });
    } catch (error) {
      throw new OidcClientGetEndSessionUrlException();
    }

    /**
     * Temporary remove client_id from endSessionUrl since parameter was not provided in previous version of openid-client
     * This might break the logout with our Idps
     * @todo #1449 Enable client_id in endSessionUrl
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1449
     *
     */

    const temporaryWorkAroundUrl = endSessionUrl.replace(
      /(&|\?)client_id=[^&]+/,
      '',
    );

    return temporaryWorkAroundUrl;
  }

  async hasEndSessionUrl(idpId: string): Promise<boolean> {
    const client = await this.issuer.getClient(idpId);

    let endSessionUrl;

    try {
      endSessionUrl = buildEndSessionUrl(client);
      return isURL(endSessionUrl, {
        protocols: ['https'],
        // Validator.js defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        require_protocol: true,
      });
    } catch (error) {
      this.logger.err({ error });
      return false;
    }
  }

  async checkIdpDisabled(idpId: string): Promise<void> {
    const idp = await this.identityProvider.getById(idpId);

    if (!idp) {
      throw new OidcClientIdpNotFoundException();
    }

    if (!idp.active) {
      throw new OidcClientIdpDisabledException();
    }
  }
}
