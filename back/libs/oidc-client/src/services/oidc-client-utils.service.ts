import { JWK } from 'jose';
import { TokenSet, Client } from 'openid-client';
import { Inject, Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import {
  IOidcIdentity,
  IServiceProviderAdapter,
  SERVICE_PROVIDER_SERVICE_TOKEN,
} from '@fc/oidc';
import {
  OidcClientMissingCodeException,
  OidcClientMissingStateException,
  OidcClientInvalidStateException,
  OidcClientTokenFailedException,
  OidcClientFailedToFetchBlacklist,
  OidcClientIdpBlacklistedException,
  OidcClientGetEndSessionUrlException,
} from '../exceptions';
import { OidcClientIssuerService } from './oidc-client-issuer.service';
import { OidcClientConfigService } from './oidc-client-config.service';
import { IGetAuthorizeUrlParams } from '../interfaces/get-authorize-url-params.interface';

@Injectable()
export class OidcClientUtilsService {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly logger: LoggerService,
    private readonly issuer: OidcClientIssuerService,
    private readonly oidcClientConfig: OidcClientConfigService,
    private readonly crypto: CryptographyService,
    @Inject(SERVICE_PROVIDER_SERVICE_TOKEN)
    private readonly serviceProvider: IServiceProviderAdapter,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async buildAuthorizeParameters() {
    const { stateLength } = await this.oidcClientConfig.get();
    const state = this.crypto.genRandomString(stateLength);
    /**
     * @TODO #430 specific parameter for nonce length (or rename mutual parameter)
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/430
     * choisir entre uid et getreandomstring
     */
    const nonce = this.crypto.genRandomString(stateLength);

    return {
      state,
      nonce,
    };
  }

  async getAuthorizeUrl({
    state,
    scope,
    providerUid,
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values,
    nonce,
    claims,
  }: IGetAuthorizeUrlParams): Promise<string> {
    const client: Client = await this.issuer.getClient(providerUid);

    const params = {
      scope,
      state,
      nonce,
      claims,
      // oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      prompt: 'login',
    };

    return client.authorizationUrl(params);
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

  private async extractParams(req, client, stateFromSession: string) {
    /**
     * Although it is not noted as async
     * openidClient.callbackParams is and should be awaited
     */
    const receivedParams = await client.callbackParams(req);

    if (!receivedParams.code) {
      throw new OidcClientMissingCodeException();
    }

    if (!receivedParams.state) {
      throw new OidcClientMissingStateException();
    }

    if (receivedParams.state !== stateFromSession) {
      throw new OidcClientInvalidStateException();
    }

    return receivedParams;
  }

  async getTokenSet(
    req,
    providerUid: string,
    stateFromSession: string,
    nonceFromSession?: string,
  ): Promise<TokenSet> {
    this.logger.debug('getTokenSet');
    const client = await this.issuer.getClient(providerUid);

    const receivedParams = await this.extractParams(
      req,
      client,
      stateFromSession,
    );

    try {
      // Invoke `openid-client` handler
      const tokenSet = await client.callback(
        client.metadata.redirect_uris.join(','),
        receivedParams,
        {
          state: stateFromSession,
          nonce: nonceFromSession,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          response_type: client.metadata.response_types.join(','),
        },
      );

      return tokenSet;
    } catch (error) {
      throw new OidcClientTokenFailedException(error);
    }
  }

  async revokeToken(accessToken: string, providerUid: string): Promise<void> {
    this.logger.debug('revokeToken');
    const client = await this.issuer.getClient(providerUid);

    await client.revoke(accessToken);
  }

  async getUserInfo(
    accessToken: string,
    providerUid: string,
  ): Promise<IOidcIdentity> {
    this.logger.debug('getUserInfo');
    const client = await this.issuer.getClient(providerUid);

    const userInfo = await client.userinfo(accessToken);
    this.logger.trace({ userInfo });

    return userInfo;
  }

  /**
   * Build the endSessionUrl with given parameters
   * @param providerUid The current idp id
   * @param stateFromSession The current state
   * @param idTokenHint The last idToken retrieved
   * @param postLogoutRedirectUri The url to redirect after logout
   * @returns The endSessionUrl with all parameters (state, postLogoutRedirectUri, ...)
   */
  async getEndSessionUrl(
    providerUid: string,
    stateFromSession: string,
    idTokenHint?: TokenSet | string,
    postLogoutRedirectUri?: string,
  ): Promise<string> {
    this.logger.debug('getEndSessionUrl');
    const client = await this.issuer.getClient(providerUid);

    let endSessionUrl;

    try {
      endSessionUrl = client.endSessionUrl({
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        id_token_hint: idTokenHint,
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        post_logout_redirect_uri: postLogoutRedirectUri,
        state: stateFromSession,
      });
    } catch (error) {
      throw new OidcClientGetEndSessionUrlException(error);
    }

    this.logger.trace({ endSessionUrl });

    return endSessionUrl;
  }

  /**
   * Method to check if
   * an identity provider is blacklisted or whitelisted
   * @param spId service provider ID
   * @param idpId identity provider ID
   * @returns {boolean}
   */
  async checkIdpBlacklisted(spId: string, idpId: string): Promise<boolean> {
    let isIdpExcluded = false;
    try {
      isIdpExcluded = await this.serviceProvider.shouldExcludeIdp(spId, idpId);
    } catch (error) {
      throw new OidcClientFailedToFetchBlacklist(error);
    }

    if (isIdpExcluded) {
      throw new OidcClientIdpBlacklistedException(spId, idpId);
    }
    return false;
  }
}
