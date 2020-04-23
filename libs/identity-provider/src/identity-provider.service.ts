import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  IdentityProviderMetadata,
  IIdentityProviderService,
} from '@fc/oidc-client';
import { CryptographyService } from '@fc/cryptography';
import { IIdentityProvider } from './interfaces';

@Injectable()
export class IdentityProviderService implements IIdentityProviderService {
  constructor(
    @InjectModel('IdentityProvider')
    private readonly identityProviderModel: Model<IIdentityProvider>,
    private readonly cryptography: CryptographyService,
  ) {}

  private async findAllIdentityProvider(): Promise<IIdentityProvider[]> {
    const rawResult = await this.identityProviderModel
      .find(
        {},
        {
          _id: false,
          name: true,
          clientID: true,
          clientSecretHash: true,
          discoveryUrl: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          redirect_uris: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          id_token_encrypted_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          id_token_encrypted_response_enc: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          userinfo_signed_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          userinfo_encrypted_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          userinfo_encrypted_response_enc: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          response_types: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          id_token_signed_response_alg: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          token_endpoint_auth_method: true,
        },
      )
      .exec();

    return rawResult.map(({ _doc }) => _doc);
  }

  async getList(): Promise<IdentityProviderMetadata[]> {
    const list = await this.findAllIdentityProvider();

    return list.map(identityProvider => {
      return this.legacyToOpenIdPropertyName(identityProvider);
    });
  }

  /* eslint-disable @typescript-eslint/camelcase */
  private legacyToOpenIdPropertyName(
    source: IIdentityProvider,
  ): IdentityProviderMetadata {
    const client_id = source.clientID;
    const client_secret = this.cryptography.decryptSecretHash(
      source.clientSecretHash,
    );

    Reflect.deleteProperty(source, 'clientID');
    Reflect.deleteProperty(source, 'clientSecretHash');

    return {
      ...source,
      client_id,
      client_secret,
    } as IdentityProviderMetadata;
  }
  /* eslint-enable @typescript-eslint/camelcase */
}
