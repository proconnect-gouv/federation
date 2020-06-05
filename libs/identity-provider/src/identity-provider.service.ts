import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { validateDto, asyncFilter } from '@fc/common';
import { validationOptions } from '@fc/config';
import {
  IdentityProviderMetadata,
  IIdentityProviderService,
} from '@fc/oidc-client';
import { CryptographyService } from '@fc/cryptography';
import { IIdentityProvider } from './interfaces';
import { IdentityProviderDTO } from './dto';

@Injectable()
export class IdentityProviderService implements IIdentityProviderService {
  private listCache: IdentityProviderMetadata[];

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
          uid: true,
          name: true,
          active: true,
          display: true,
          clientID: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          client_secret: true,
          discoveryUrl: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          redirect_uris: true,
          // oidc defined variable name
          // eslint-disable-next-line @typescript-eslint/camelcase
          post_logout_redirect_uris: true,
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

    const result: any = await asyncFilter(rawResult, async ({ _doc }) => {
      const errors = await validateDto(
        _doc,
        IdentityProviderDTO,
        validationOptions,
      );
      return errors.length < 1;
    });

    return result.map(({ _doc }) => _doc);
  }

  /**
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList(refreshCache = false): Promise<IdentityProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      const list: IIdentityProvider[] = await this.findAllIdentityProvider();

      this.listCache = list.map(identityProvider => {
        return this.legacyToOpenIdPropertyName(identityProvider);
      });
    }
    return this.listCache;
  }

  async getById(
    id: string,
    refreshCache = false,
  ): Promise<IdentityProviderMetadata> {
    const providers = await this.getList(refreshCache);

    return providers.find(({ uid }) => uid === id);
  }

  /* eslint-disable @typescript-eslint/camelcase */
  private legacyToOpenIdPropertyName(
    source: IIdentityProvider,
  ): IdentityProviderMetadata {
    const client_id = source.clientID;
    const client_secret = this.cryptography.decryptClientSecret(
      source.client_secret,
    );

    Reflect.deleteProperty(source, 'clientID');
    Reflect.deleteProperty(source, 'client_secret');

    return {
      ...source,
      client_id,
      client_secret,
    } as IdentityProviderMetadata;
  }
  /* eslint-enable @typescript-eslint/camelcase */
}
