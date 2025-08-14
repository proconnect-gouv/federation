import { ObjectID } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FqdnToProvider } from './fqdn-to-provider.mongodb.entity';
import {
  IdentityProviderFromDb,
  IdentityProviderWithFqdn,
} from '../identity-provider';
import { IFqdnToProvider } from './interface/fqdn.interface';

@Injectable()
export class FqdnToProviderService {
  constructor(
    @InjectRepository(FqdnToProvider, 'fc-mongo')
    private readonly fqdnToProviderRepository: MongoRepository<FqdnToProvider>,
  ) {}

  private async findFqdnsForProviders(
    identityProvidersUuids: string[],
  ): Promise<FqdnToProvider[]> {
    const fqdnToProviders = await this.fqdnToProviderRepository.find({
      where: {
        identityProvider: { $in: identityProvidersUuids },
      },
    });

    return fqdnToProviders;
  }

  private async findFqdnsForOneProvider(
    identityProviderUid: string,
  ): Promise<FqdnToProvider[]> {
    const fqdnToProvider = await this.fqdnToProviderRepository.find({
      where: {
        identityProvider: identityProviderUid,
      },
    });

    return fqdnToProvider;
  }

  async getFqdnsForIdentityProviderUid(idpUid: string): Promise<string[]> {
    const fqdnToProviders = await this.findFqdnsForOneProvider(idpUid);

    return fqdnToProviders.map(({ fqdn }) => fqdn);
  }

  async getProvidersWithFqdns(
    identityProviders: IdentityProviderFromDb[],
  ): Promise<IdentityProviderWithFqdn[]> {
    const identityProvidersUids = identityProviders.map(
      (identityProviderFromDb) => identityProviderFromDb.uid,
    );

    const fqdnToProviders = await this.findFqdnsForProviders(
      identityProvidersUids,
    );

    return this.aggregateFqdnToProviderWithIdentityProvider(
      identityProviders,
      fqdnToProviders,
    );
  }

  async saveFqdnsProvider(
    identityProviderUid: string,
    fqdns: string[],
  ): Promise<void> {
    const filteredFqdns = fqdns.filter(Boolean);
    for (let index = 0; index < filteredFqdns.length; index++) {
      const fqdn = filteredFqdns[index];
      await this.fqdnToProviderRepository.save({
        fqdn,
        identityProvider: identityProviderUid,
        acceptsDefaultIdp: true,
      });
    }
  }

  async updateFqdnsProvider(
    identityProviderUid: string,
    fqdns: string[],
    identityProviderId: string,
  ): Promise<void> {
    /**
     * We currently don't have a fqdn interface where we can handle acceptance.
     * So we cannot find the value of acceptance in the input
     * and must fetch it in db.
     * We only fetch the fqdns of the idp that match the input fqdns.
     */
    const existingFqdnToProviders: Array<
      Pick<IFqdnToProvider, 'fqdn' | 'acceptsDefaultIdp'>
    > = await this.fqdnToProviderRepository.find({
      select: {
        fqdn: true,
        acceptsDefaultIdp: true,
      },
      where: {
        _id: ObjectID(identityProviderId),
        // we only keep the fqdns that are in the new list
        // we will delete the others
        fqdn: { $in: fqdns } as any,
      },
    });

    /**
     * Then we filter the new fqdns to create:
     * new fqdns are the fqdn from input that are not already in the collection.
     * We gave them a true default acceptance value.
     */
    const fqdnsToAdd: Array<
      Pick<IFqdnToProvider, 'fqdn' | 'acceptsDefaultIdp'>
    > = fqdns
      .filter(
        (fqdnToAddFqdn) =>
          !existingFqdnToProviders.some(
            (fqdnToProvider) => fqdnToProvider.fqdn === fqdnToAddFqdn,
          ),
      )
      .map((fqdn) => ({ fqdn, acceptsDefaultIdp: true }));

    // Eventually we merge the new fqdns with the fetched fqdnToProvider
    const newFqdnToProviders = [...existingFqdnToProviders, ...fqdnsToAdd];

    // delete all previous relations for this identityProvider
    await this.deleteFqdnsProvider(identityProviderUid);

    if (newFqdnToProviders.length === 0) {
      return;
    }

    // create new relations
    await this.saveFqdnsProvider(
      identityProviderUid,
      newFqdnToProviders.map(({ fqdn }) => fqdn),
    );
  }

  async deleteFqdnsProvider(identityProviderUid: string): Promise<void> {
    const existingFqdns = await this.fqdnToProviderRepository.find({
      where: {
        identityProvider: identityProviderUid,
      },
    });
    if (existingFqdns?.length > 0) {
      await this.fqdnToProviderRepository.delete({
        _id: { $in: existingFqdns.map((fqdn) => fqdn._id) } as any,
      });
    }
  }

  private aggregateFqdnToProviderWithIdentityProvider(
    identityProviders: IdentityProviderFromDb[],
    fqdnToProviders: IFqdnToProvider[],
  ): IdentityProviderWithFqdn[] {
    const fqdnToProvidersHashMap: Record<string, string[]> = {};

    fqdnToProviders.forEach(({ identityProvider: uid, fqdn }) => {
      if (!fqdnToProvidersHashMap[uid]) {
        return (fqdnToProvidersHashMap[uid] = [fqdn]);
      } else {
        return fqdnToProvidersHashMap[uid].push(fqdn);
      }
    });

    return identityProviders.map((identityProvider) => {
      const idpWithFqdns = {
        ...identityProvider,
        fqdns: fqdnToProvidersHashMap[identityProvider.uid] || [],
      };

      return idpWithFqdns;
    });
  }
}
