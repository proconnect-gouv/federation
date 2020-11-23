import { JWK } from 'jose';
import { TokenSet, Client } from 'openid-client';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import { IOidcIdentity } from '@fc/oidc';
import { OidcClientConfig } from '../dto';
import {
  OidcClientMissingCodeException,
  OidcClientMissingStateException,
  OidcClientInvalidStateException,
  OidcClientRuntimeException,
} from '../exceptions';
import { OidcClientIssuerService } from './oidc-client-issuer.service';
import { OidcClientConfigService } from './oidc-client-config.service';

@Injectable()
export class OidcClientService {
  private configuration: OidcClientConfig;

  constructor(
    private readonly logger: LoggerService,
    private readonly issuer: OidcClientIssuerService,
    private readonly oidcClientConfig: OidcClientConfigService,
    private readonly crypto: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async buildAuthorizeParameters(params) {
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { uid, scope, providerUid, acr_values } = params;
    const { stateLength } = await this.oidcClientConfig.get();
    const state = this.crypto.genRandomString(stateLength);
    /**
     * @TODO specific parameter for nonce length (or rename mutual parameter)
     */
    const nonce = this.crypto.genRandomString(stateLength);

    return {
      state,
      nonce,
      uid,
      scope,
      providerUid,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
    };
  }

  async getAuthorizeUrl(
    state: string,
    scope: string,
    providerUid: string,
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    acr_values: string,
    nonce?: string,
  ): Promise<string> {
    const client: Client = await this.issuer.getClient(providerUid);

    const params = {
      scope,
      state,
      nonce,
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
     * @TODO Check why `JSONWebKeySet` entries are not compatible with `asKey` method
     * Maybe we don't need this convertion?
     */
    const publicKeys = keys.map((key) => JWK.asKey(key as any).toJWK());

    return { keys: publicKeys };
  }

  async getTokenSet(
    req,
    providerUid: string,
    stateFromSession: string,
    nonceFromSession?: string,
  ): Promise<TokenSet> {
    this.logger.debug('getTokenSet');
    const client = await this.issuer.getClient(providerUid);

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
      throw new OidcClientRuntimeException(error);
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

    return client.userinfo(accessToken);
  }

  /**
   * Expose config reload mechanism for external event handlers
   */
  public async reloadConfiguration(): Promise<void> {
    await this.oidcClientConfig.reload();
  }
}
