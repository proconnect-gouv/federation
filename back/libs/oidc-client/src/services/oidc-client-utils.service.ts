/**
 * @TODO #1024 MAJ Jose version 3.X
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1024
 * @ticket #FC-1024
 */
import { isURL } from 'class-validator';
import { Request } from 'express';
import {
  AuthorizationParameters,
  CallbackExtras,
  CallbackParamsType,
  Client,
  TokenSet,
} from 'openid-client';

import { Injectable } from '@nestjs/common';

import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';

import {
  OidcClientGetEndSessionUrlException,
  OidcClientInvalidStateException,
  OidcClientMissingStateException,
  OidcClientTokenFailedException,
  OidcClientUserinfoFailedException,
} from '../exceptions';
import { ExtraTokenParams, TokenParams } from '../interfaces';
import { OidcClientConfigService } from './oidc-client-config.service';
import { OidcClientIssuerService } from './oidc-client-issuer.service';

@Injectable()
export class OidcClientUtilsService {
  constructor(
    private readonly logger: LoggerService,
    private readonly issuer: OidcClientIssuerService,
    private readonly oidcClientConfig: OidcClientConfigService,
    private readonly crypto: CryptographyService,
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
    authorizationParams: AuthorizationParameters,
  ): Promise<string> {
    const client: Client = await this.issuer.getClient(idpId);

    return client.authorizationUrl(authorizationParams);
  }

  async checkState(
    idpId: string,
    callbackParams,
    stateFromSession: string,
  ): Promise<void> {
    if (!callbackParams.state) {
      const supportEmail = await this.issuer.getSupportEmail(idpId);
      throw new OidcClientMissingStateException(supportEmail);
    }

    if (callbackParams.state !== stateFromSession) {
      const supportEmail = await this.issuer.getSupportEmail(idpId);
      throw new OidcClientInvalidStateException(supportEmail);
    }
  }

  private async extractParams(
    idpId: string,
    callbackParams: CallbackParamsType,
    stateFromSession: string,
  ): Promise<any> {
    await this.checkState(idpId, callbackParams, stateFromSession);

    return callbackParams;
  }

  private buildExtraParameters(extraParams: ExtraTokenParams): CallbackExtras {
    if (extraParams) {
      return { exchangeBody: extraParams };
    }

    return {};
  }

  async getTokenSet(
    req: Request,
    idpId: string,
    params: TokenParams,
    extraParams?: ExtraTokenParams,
  ): Promise<TokenSet> {
    const client = await this.issuer.getClient(idpId);
    const { state } = params;

    const callbackParams = client.callbackParams(req);
    const receivedParams = await this.extractParams(
      idpId,
      callbackParams,
      state,
    );

    let tokenSet: TokenSet;

    try {
      // Invoke `openid-client` handler
      tokenSet = await client.callback(
        client.metadata.redirect_uris.join(','),
        receivedParams,
        {
          ...params,
          response_type: client.metadata.response_types.join(','),
        },
        this.buildExtraParameters(extraParams),
      );
    } catch (error) {
      const contactEmail = await this.issuer.getSupportEmail(idpId);

      throw new OidcClientTokenFailedException(contactEmail, error);
    }

    return tokenSet;
  }

  async revokeToken(accessToken: string, idpId: string): Promise<void> {
    const client = await this.issuer.getClient(idpId);

    await client.revoke(accessToken);
  }

  async getUserInfo<T>(accessToken: string, idpId: string): Promise<T> {
    const client = await this.issuer.getClient(idpId);

    try {
      return await client.userinfo<T>(accessToken);
    } catch (error) {
      const supportEmail = await this.issuer.getSupportEmail(idpId);
      throw new OidcClientUserinfoFailedException(supportEmail, error);
    }
  }

  /**
   * Exchange a refresh token for a new token set.
   *
   * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.12.2
   *
   * @param {string} refreshToken A currently valid refresh token
   * @param {string} idpId The current idp id
   * @returns {Promise<TokenSet>} If successful, the token set from the refresh response
   */
  async refreshTokens(refreshToken: string, idpId: string): Promise<TokenSet> {
    const client = await this.issuer.getClient(idpId);

    const tokenSet = await client.refresh(refreshToken);

    return tokenSet;
  }

  /**
   * Build the endSessionUrl with given parameters.
   *
   * @param {string} idpId The current idp id
   * @param {string} stateFromSession The current state
   * @param {TokenSet | string} idTokenHint The last idToken retrieved
   * @param {string} postLogoutRedirectUri The url to redirect after logout
   * @returns {Promise<string>} The endSessionUrl with all parameters (state, postLogoutRedirectUri, ...)
   */
  async getEndSessionUrl(
    idpId: string,
    stateFromSession: string,
    idTokenHint?: TokenSet | string,
    postLogoutRedirectUri?: string,
  ): Promise<string> {
    const client = await this.issuer.getClient(idpId);

    let endSessionUrl;

    try {
      endSessionUrl = client.endSessionUrl({
        id_token_hint: idTokenHint,
        post_logout_redirect_uri: postLogoutRedirectUri,
        state: stateFromSession,
      });
    } catch (error) {
      const supportEmail = await this.issuer.getSupportEmail(idpId);
      throw new OidcClientGetEndSessionUrlException(supportEmail, error);
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
    if (!idpId) {
      return false;
    }

    const client = await this.issuer.getClient(idpId);

    try {
      const endSessionUrl = client.endSessionUrl();
      return isURL(endSessionUrl, {
        protocols: ['https'],
        // Validator.js defined property
        // eslint-disable-next-line @typescript-eslint/naming-convention
        require_protocol: true,
      });
    } catch (error) {
      this.logger.error({ error });
      return false;
    }
  }
}
