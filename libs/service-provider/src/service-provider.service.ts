import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { validateDto, asyncFilter } from '@fc/common';
import { validationOptions } from '@fc/config';
import {
  ServiceProviderMetadata,
  IServiceProviderService,
} from '@fc/oidc-provider';
import { CryptographyService } from '@fc/cryptography';
import { IServiceProvider } from './interfaces';
import { ServiceProviderDTO } from './dto';

@Injectable()
export class ServiceProviderService implements IServiceProviderService {
  private listCache: ServiceProviderMetadata[];

  constructor(
    @InjectModel('ServiceProvider')
    private readonly serviceProviderModel: Model<IServiceProvider>,
    private readonly cryptography: CryptographyService,
  ) {}

  private async findAllServiceProvider(): Promise<IServiceProvider[]> {
    const rawResult = await this.serviceProviderModel
      .find(
        {
          active: true,
        },
        {
          _id: false,
          active: true,
          key: true,
          // legacy defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          client_secret: true,
          scopes: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          redirect_uris: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          post_logout_redirect_uris: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          id_token_signed_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          id_token_encrypted_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          id_token_encrypted_response_enc: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          userinfo_signed_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          userinfo_encrypted_response_alg: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          userinfo_encrypted_response_enc: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          jwks_uri: true,
        },
      )
      .exec();

    const result: any = await asyncFilter(rawResult, async ({ _doc }) => {
      const errors = await validateDto(
        _doc,
        ServiceProviderDTO,
        validationOptions,
      );
      return errors.length < 1;
    });

    return result.map(({ _doc }) => _doc);
  }

  async isActive(clientId: string): Promise<boolean> {
    const serviceProviderList = await this.getList();
    const sp = serviceProviderList.find(({ client_id: id }) => id === clientId);

    return Boolean(sp && sp.active);
  }

  /**
   * @TODO give restricted output data (interface IServiceProvider)
   * @param refreshCache  Should we refreshCache the cache made by the service?
   */
  async getList(refreshCache = false): Promise<ServiceProviderMetadata[]> {
    if (refreshCache || !this.listCache) {
      const list: IServiceProvider[] = await this.findAllServiceProvider();
      this.listCache = list.map(serviceProvider => {
        return this.legacyToOpenIdPropertyName(serviceProvider);
      });
    }

    return this.listCache;
  }

  async getById(
    id: string,
    refreshCache = false,
  ): Promise<ServiceProviderMetadata> {
    const list = await this.getList(refreshCache);
    return list.find(({ client_id: dbId }) => dbId === id);
  }

  /* eslint-disable @typescript-eslint/camelcase */
  private legacyToOpenIdPropertyName(
    source: IServiceProvider,
  ): ServiceProviderMetadata {
    const client_id = source.key;
    const client_secret = this.cryptography.decryptClientSecret(
      source.client_secret,
    );
    const scope = source.scopes.join(' ');

    Reflect.deleteProperty(source, 'key');
    Reflect.deleteProperty(source, 'client_secret');
    Reflect.deleteProperty(source, 'scopes');

    return {
      ...source,
      client_id,
      client_secret,
      scope,
    } as ServiceProviderMetadata;
  }
  /* eslint-enable @typescript-eslint/camelcase */
}
