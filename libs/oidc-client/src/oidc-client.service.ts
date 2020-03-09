/** @TODO Remove once config params deported in config module */
/* eslint-disable @typescript-eslint/camelcase */
import { Injectable } from '@nestjs/common';
import {
  Issuer,
  ResponseType,
  TokenSet,
  generators,
  Client,
  ClientAuthMethod,
} from 'openid-client';

@Injectable()
export class OidcClientService {
  // @TODO: validation body by interface
  async getAuthorizeUrl(body, req): Promise<string> {
    const client: Client = await this.createOidcClient();

    const codeVerifier = generators.codeVerifier();
    const codeChallenge = generators.codeChallenge(codeVerifier);

    /** @TODO store the code_verifier in session mechanism */
    req.session.codeVerifier = codeVerifier;

    return client.authorizationUrl({
      scope: body.scopes,
      state: body.state,
      acr_values: body.acr_values,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });
  }

  /** @TODO interface tokenSet, to see what we keep ? */
  async getTokenSet(req): Promise<TokenSet> {
    const client = await this.createOidcClient();
    const params = await client.callbackParams(req);
    const tokenSet = await client.callback(
      this.getFcAsSpConfig().redirect_uris.join(','),
      params,
      {
        state: params.state,
        code_verifier: req.session.codeVerifier,
        response_type: this.getFcAsSpConfig().response_types.join(','),
      },
    );

    console.log('tokenSet', tokenSet);
    return tokenSet;
  }

  /** @TODO interface userinfo */
  async getUserInfo(accessToken: string): Promise<object> {
    const client = await this.createOidcClient();
    return client.userinfo(accessToken);
  }

  private async createOidcClient(): Promise<Client> {
    // retrieve provider metadata
    /**
     * @TODO Get data from...
     * .well-known URL from config / database?
     * Issuer from cache in memory? => optimization => later
     *
     * @TODO handle network failure with specific Exception / error code
     */
    const issuer = await Issuer.discover(
      'https://fip1v2.docker.dev-franceconnect.fr/.well-known/openid-configuration',
    );

    // create FC client as SP
    return new issuer.Client(this.getFcAsSpConfig());
  }

  /** @TODO Get from config (validation is done at config load time) */
  private getFcAsSpConfig(): {
    token_endpoint_auth_method: ClientAuthMethod;
    client_id: string;
    client_secret: string;
    response_types: ResponseType[];
    redirect_uris: string[];
    post_logout_redirect_uris: string[];
    id_token_signed_response_alg: string;
    authorization_signed_response_alg: string;
    grant_types: string[];
  } {
    return {
      token_endpoint_auth_method: 'client_secret_post',
      client_id: '09a1a257648c1742c74d6a3d84b31943',
      client_secret: '7ae4fef2aab63fb78d777fe657b7536f',
      response_types: ['code'],
      redirect_uris: [
        'https://corev2.docker.dev-franceconnect.fr/api/v2/oidc-callback',
      ],
      post_logout_redirect_uris: [
        'https://corev2.docker.dev-franceconnect.fr/api/v2/logout-callback',
      ],
      id_token_signed_response_alg: 'HS256',
      authorization_signed_response_alg: 'HS256',
      grant_types: ['authorization_code'],
    };
  }
}
