import { MongoRepository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FqdnToProvider } from './fqdn-to-provider.mongodb.entity';
import { IIdentityProvider, IIdentityProviderDTO } from '../identity-provider';
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

    if (!fqdnToProvider) {
      return [];
    }

    return fqdnToProvider;
  }

  async getProviderWithFqdns(
    identityProvider: IIdentityProviderDTO,
  ): Promise<IIdentityProviderDTO> {
    const fqdnToProviders = await this.findFqdnsForOneProvider(
      identityProvider.uid,
    );

    const idpWithFqdns = { ...identityProvider, fqdns: [] };
    fqdnToProviders.forEach(({ fqdn }) => {
      idpWithFqdns.fqdns.push(fqdn);
    });

    return idpWithFqdns;
  }

  async getProvidersWithFqdns(
    identityProviders: IIdentityProvider[],
  ): Promise<IIdentityProviderDTO[]> {
    const identityProvidersUids = identityProviders.map(
      (idp: IIdentityProvider) => idp.uid,
    );

    const fqdnToProviders = await this.findFqdnsForProviders(
      identityProvidersUids,
    );

    return this.getIdentityProvidersDTO(identityProviders, fqdnToProviders);
  }

  createFqdnsWithAcceptance(
    fqdns: string[],
  ): Array<Pick<IFqdnToProvider, 'fqdn' | 'acceptsDefaultIdp'>> {
    return fqdns.map((fqdn) => {
      return {
        fqdn,
        // by default, for now, the fqdn is accepted
        acceptsDefaultIdp: true,
      };
    });
  }

  async saveFqdnsProvider(
    identityProviderUid: string,
    fqdns: Array<Pick<IFqdnToProvider, 'fqdn' | 'acceptsDefaultIdp'>>,
  ): Promise<void> {
    fqdns.filter(Boolean).forEach(async (fqdn) => {
      await this.fqdnToProviderRepository.save({
        fqdn: fqdn.fqdn,
        identityProvider: identityProviderUid,
        acceptsDefaultIdp: fqdn.acceptsDefaultIdp,
      });
    });
  }

  async updateFqdnsProvider(
    identityProviderUid: string,
    fqdns: string[],
    providerId: string,
  ): Promise<void> {
    /**
     * We currently don't have a fqdn interface where we can handle acceptance.
     * So we cannot find the value of acceptance in the input
     * and must fetch it in db.
     * We only fetch the fqdns of the idp that match the input fqdns.
     */
    const providerFqdns: Array<
      Pick<IFqdnToProvider, 'fqdn' | 'acceptsDefaultIdp'>
    > = await this.fqdnToProviderRepository.find({
      select: {
        fqdn: true,
        acceptsDefaultIdp: true,
      },
      where: {
        _id: providerId,
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
        (fqdn) =>
          !providerFqdns.find((fqdnToProvider) => fqdnToProvider.fqdn === fqdn),
      )
      .map((fqdn) => ({ fqdn, acceptsDefaultIdp: true }));

    // Eventually we merge the new fqdns with the fetched fqdnToProvider
    providerFqdns.push(...fqdnsToAdd);

    // delete all previous relations for this identityProvider
    await this.deleteFqdnsProvider(identityProviderUid);

    if (providerFqdns.length === 0) {
      return;
    }

    // create new relations
    await this.saveFqdnsProvider(identityProviderUid, providerFqdns);
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

  private getIdentityProvidersDTO(
    identityPoviders: IIdentityProvider[],
    fqdnToProviders: IFqdnToProvider[],
  ): IIdentityProviderDTO[] {
    const fqdnToProvidersHashMap: Record<string, string[]> = {};

    fqdnToProviders.forEach(({ identityProvider: uid, fqdn }) => {
      if (!fqdnToProvidersHashMap[uid]) {
        return (fqdnToProvidersHashMap[uid] = [fqdn]);
      } else {
        return fqdnToProvidersHashMap[uid].push(fqdn);
      }
    });

    return identityPoviders.map((identityProvider) => {
      const idpWithFqdns = {
        ...identityProvider,
        fqdns: fqdnToProvidersHashMap[identityProvider.uid] || [],
      };

      return idpWithFqdns;
    });
  }
}
