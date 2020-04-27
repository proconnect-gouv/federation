import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  ServiceProviderMetadata,
  IServiceProviderService,
} from '@fc/oidc-provider';
import { CryptographyService } from '@fc/cryptography';
import { IServiceProvider } from './interfaces';

@Injectable()
export class ServiceProviderService implements IServiceProviderService {
  /**
   * @TODO see to add timestamps on the latest sp list cached version reloaded
   * sp list cached reloaded by oidc-provider.service
   */
  private serviceProviderListCache: ServiceProviderMetadata[];

  constructor(
    @InjectModel('ServiceProvider')
    private readonly serviceProviderModel: Model<IServiceProvider>,
    private readonly cryptography: CryptographyService,
  ) {}

  private async findAllServiceProvider(): Promise<IServiceProvider[]> {
    const rawResult = await this.serviceProviderModel
      .find(
        {},
        {
          _id: false,
          active: true,
          key: true,
          // legacy defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          secret_hash: true,
          // openid defined property names
          // eslint-disable-next-line @typescript-eslint/camelcase
          redirect_uris: true,
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

    return rawResult.map(({ _doc }) => _doc);
  }

  async isActive(clientId: string): Promise<boolean> {
    const serviceProviderList = await this.getList();
    const sp = serviceProviderList.find(({ client_id: id }) => id === clientId);

    return Boolean(sp && sp.active);
  }

  /**
   * @TODO give restricted output data (interface IServiceProvider)
   */
  async getList(refresh = false): Promise<ServiceProviderMetadata[]> {
    if (refresh || !this.serviceProviderListCache) {
      const list = await this.findAllServiceProvider();

      this.serviceProviderListCache = list.map(serviceProvider => {
        return this.legacyToOpenIdPropertyName(serviceProvider);
      });
    }

    return this.serviceProviderListCache;
  }

  /* eslint-disable @typescript-eslint/camelcase */
  private legacyToOpenIdPropertyName(
    source: IServiceProvider,
  ): ServiceProviderMetadata {
    const client_id = source.key;
    const client_secret = this.cryptography.decryptSecretHash(
      source.secret_hash,
    );

    Reflect.deleteProperty(source, 'key');
    Reflect.deleteProperty(source, 'secret_hash');

    return {
      ...source,
      client_id,
      client_secret,
    } as ServiceProviderMetadata;
  }
  /* eslint-enable @typescript-eslint/camelcase */
}
