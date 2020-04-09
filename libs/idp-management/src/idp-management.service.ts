import { Injectable } from '@nestjs/common';
import { IdPMetadata, IIdPManagementService } from '@fc/oidc-client';

@Injectable()
export class IdPManagementService implements IIdPManagementService {
  /**
   * @TODO get data from database
   */
  async getList(): Promise<IdPMetadata[]> {
    return Promise.resolve([
      {
        id: 'fip1v2',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        well_known_url:
          'https://fip1v2.docker.dev-franceconnect.fr/.well-known/openid-configuration',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        token_endpoint_auth_method: 'client_secret_post',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_id: '09a1a257648c1742c74d6a3d84b31943',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        client_secret: '7ae4fef2aab63fb78d777fe657b7536f',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        response_types: ['code'],
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        redirect_uris: [
          'https://corev2.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1v2',
        ],
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        post_logout_redirect_uris: [
          'https://corev2.docker.dev-franceconnect.fr/api/v2/logout-callback',
        ],
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token_signed_response_alg: 'HS256',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token_encrypted_response_alg: 'RSA-OAEP',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        id_token_encrypted_response_enc: 'A256GCM',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        userinfo_signed_response_alg: 'HS256',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        userinfo_encrypted_response_alg: 'RSA-OAEP',
        // oidc defined variable name
        // eslint-disable-next-line @typescript-eslint/camelcase
        userinfo_encrypted_response_enc: 'A256GCM',
      },
    ]);
  }
}
