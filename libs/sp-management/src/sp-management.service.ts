import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SPMetadata, ISpManagementService } from '@fc/oidc-provider';
import { ISpManagement } from './interfaces/sp.interface';
import { CryptographyService } from '@fc/cryptography';

@Injectable()
export class SpManagementService implements ISpManagementService {
  constructor(
    @InjectModel('SpManagement')
    private readonly spManagementModel: Model<ISpManagement>,
    private readonly cryptographyService: CryptographyService,
  ) {}

  private async findAllServiceProvider(): Promise<ISpManagement[]> {
    const rawResult = await this.spManagementModel
      .find(
        {},
        {
          _id: false,
          key: true,
          // eslint-disable-next-line @typescript-eslint/camelcase
          secret_hash: true,
          // eslint-disable-next-line @typescript-eslint/camelcase
          redirect_uris: true,
        },
      )
      .exec();

    return rawResult.map(({ _doc }) => _doc);
  }

  /**
   * @TODO implement real code...
   */
  async isUsable(clientId: string): Promise<boolean> {
    return Promise.resolve(!!clientId);
  }

  /**
   * @TODO give restricted output data (interface ISpManagement)
   */
  async getList(): Promise<SPMetadata[]> {
    const list = await this.findAllServiceProvider();

    return list.map(serviceProvider => {
      return Object.keys(serviceProvider).reduce((metadatas, key) => {
        switch (key) {
          // transform legacy variable (key) to client_id
          case 'key':
            metadatas['client_id'] = serviceProvider[key];
            break;
          // transform legacy variable (secret_hash) to client_secret
          case 'secret_hash':
            metadatas[
              'client_secret'
            ] = this.cryptographyService.decryptSecretHash(
              serviceProvider[key],
            );
            break;
          default:
            metadatas[key] = serviceProvider[key];
            break;
        }
        return metadatas;
      }, {});
    });
  }
}
