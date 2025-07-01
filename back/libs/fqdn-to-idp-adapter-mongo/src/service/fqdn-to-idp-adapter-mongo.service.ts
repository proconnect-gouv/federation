import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import * as deepFreeze from 'deep-freeze';
import { filter } from 'lodash';
import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { LoggerService } from '@fc/logger';
import { MongooseCollectionOperationWatcherHelper } from '@fc/mongoose';

import { GetFqdnToIdentityProviderMongoDto } from '../dto/fqdn-to-idp-mongo.dto';
import { IFqdnToIdentityProviderAdapter } from '../interfaces';
import { FqdnToIdentityProvider } from '../schemas';

@Injectable()
export class FqdnToIdpAdapterMongoService
  implements IFqdnToIdentityProviderAdapter
{
  private fqdnToIdpCache: FqdnToIdentityProvider[];

  constructor(
    @InjectModel('FqdnToIdentityProvider')
    private readonly FqdnToIdentityProviderModel: Model<FqdnToIdentityProvider>,
    private readonly logger: LoggerService,
    private readonly mongooseWatcher: MongooseCollectionOperationWatcherHelper,
  ) {}

  async onModuleInit() {
    this.mongooseWatcher.watchWith<FqdnToIdentityProvider>(
      this.FqdnToIdentityProviderModel,
      this.refreshCache.bind(this),
    );
    this.logger.debug('Initializing fqdn-to-identity-provider');

    // Warm up cache
    await this.getList();
  }

  /**
   * Return a list of fqdnToIdp
   * for a specific fqdn
   */
  async getIdpsByFqdn(fqdn: string): Promise<FqdnToIdentityProvider[]> {
    const allfqdnToProvider = await this.getList();
    const fqdnToProviders = allfqdnToProvider.filter(
      (row) => row.fqdn === fqdn,
    );

    return fqdnToProviders;
  }

  async refreshCache(): Promise<void> {
    await this.getList(true);
  }

  /**
   * Get fqdnToIdps from database or from cache,
   * if repository is used, cache is (re)build
   */
  async getList(refreshCache?: boolean): Promise<FqdnToIdentityProvider[]> {
    if (refreshCache || !this.fqdnToIdpCache) {
      this.logger.debug('Refresh FqdnToIdentityProvider cache from DB');

      this.fqdnToIdpCache = deepFreeze(
        await this.findAllFqdnToIdentityProvider(),
      ) as FqdnToIdentityProvider[];

      this.logger.debug({
        message: 'fqdnToIdpCache has been refreshed.',
        step: 'REFRESH',
      });
    } else {
      this.logger.debug({
        message: 'fqdnToIdpCache has been used.',
        step: 'CACHE',
      });
    }

    return this.fqdnToIdpCache;
  }

  private async findAllFqdnToIdentityProvider() {
    const rawFqdnToIdentityProviders =
      await this.FqdnToIdentityProviderModel.find(
        {},
        {
          _id: false,
          fqdn: true,
          identityProvider: true,
          acceptsDefaultIdp: true,
        },
      )
        .sort({ fqdn: 1, identityProvider: 1 })
        .lean();

    const fqdnToIdentityProviders = await Promise.all(
      rawFqdnToIdentityProviders.map(async (rawFqdnToIdentityProvider) => {
        const fqdnToIdentityProvider = plainToInstance(
          GetFqdnToIdentityProviderMongoDto,
          rawFqdnToIdentityProvider,
        );
        const errors = await validate(fqdnToIdentityProvider, {
          forbidNonWhitelisted: true,
          skipMissingProperties: false,
          whitelist: true,
        });

        const { fqdn, identityProvider } = rawFqdnToIdentityProvider;

        if (errors.length) {
          this.logger.alert({
            msg: `fqdnToProvider with domain "${fqdn}" and provider uuid "${identityProvider}" was excluded from the result at DTO validation.`,
            validationErrors: errors,
          });
        }

        return !errors.length ? fqdnToIdentityProvider : undefined;
      }),
    );

    return filter(fqdnToIdentityProviders);
  }

  fetchFqdnToIdpByEmail(email: string): Promise<FqdnToIdentityProvider[]> {
    const fqdn = email.split('@').pop().toLowerCase();
    return this.getIdpsByFqdn(fqdn);
  }
}
