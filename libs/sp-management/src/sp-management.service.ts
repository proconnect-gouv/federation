import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SPMetadata, ISpManagementService } from '@fc/oidc-provider';
import { CryptographyService } from '@fc/cryptography';
import { IServiceProvider } from './interfaces';

@Injectable()
export class SpManagementService implements ISpManagementService {
  constructor(
    @InjectModel('SpManagement')
    private readonly spManagementModel: Model<IServiceProvider>,
    private readonly cryptographyService: CryptographyService,
  ) {}

  private async findAllServiceProvider(): Promise<IServiceProvider[]> {
    const rawResult = await this.spManagementModel
      .find(
        {},
        {
          _id: false,
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

  /**
   * @TODO implement real code...
   */
  // istanbul ignore next line
  async isUsable(clientId: string): Promise<boolean> {
    return Promise.resolve(!!clientId);
  }

  /**
   * @TODO give restricted output data (interface ISpManagement)
   */
  async getList(): Promise<SPMetadata[]> {
    const list = await this.findAllServiceProvider();

    return list.map(serviceProvider => {
      return this.legacyToOpenIdPropertyName(serviceProvider);
    });
  }

  /* eslint-disable @typescript-eslint/camelcase */
  private legacyToOpenIdPropertyName(source: IServiceProvider): SPMetadata {
    const client_id = source.key;
    const client_secret = this.cryptographyService.decryptSecretHash(
      source.secret_hash,
    );

    Reflect.deleteProperty(source, 'key');
    Reflect.deleteProperty(source, 'secret_hash');

    return {
      ...source,
      client_id,
      client_secret,
    } as SPMetadata;
  }
  /* eslint-enable @typescript-eslint/camelcase */
}
