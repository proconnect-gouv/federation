import { Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import axios from 'axios';
import { LoggerService } from '../logger/logger.service';
import { IdentityProviderFromDb } from '../identity-provider/identity-provider.mongodb.entity';
import { ServiceProviderFromDb } from '../service-provider/service-provider.mongodb.entity';
import { IdentityProviderGristRecord } from './interface/identity-provider-grist-record.interface';
import { ServiceProviderGristRecord } from './interface/service-provider-grist-record.interface';

@Injectable()
export class GristPublisherService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async publishServiceProviders(serviceProviders: ServiceProviderFromDb[]) {
    const { gristServiceProvidersTableId } = this.config.get('grist');
    const serviceProviderGristRecords = serviceProviders.map(
      (serviceProvider) =>
        this.transformServiceProviderToGristRecord(serviceProvider),
    );

    return this.publish(
      serviceProviderGristRecords,
      gristServiceProvidersTableId,
    );
  }

  async publishIdentityProviders(identityProviders: IdentityProviderFromDb[]) {
    const { gristIdentityProvidersTableId } = this.config.get('grist');

    const identityProviderGristRecords = identityProviders.map(
      (identityProvider) =>
        this.transformIdentityProviderToGristRecord(identityProvider),
    );

    return this.publish(
      identityProviderGristRecords,
      gristIdentityProvidersTableId,
    );
  }

  private transformIdentityProviderToGristRecord(
    identityProviderFromDb: IdentityProviderFromDb,
  ): IdentityProviderGristRecord {
    const { gristNetworkName, gristEnvironmentName } = this.config.get('grist');

    return {
      Reseau: gristNetworkName,
      Environnement: gristEnvironmentName,
      UID: identityProviderFromDb.uid,
      Titre: identityProviderFromDb.title,
      Actif: identityProviderFromDb.active ? 'Oui' : 'Non',
      URL_de_decouverte:
        identityProviderFromDb.discoveryUrl &&
        typeof identityProviderFromDb.discoveryUrl === 'string' &&
        identityProviderFromDb.discoveryUrl.length > 0
          ? identityProviderFromDb.discoveryUrl
          : '',
      Liste_des_FQDN: identityProviderFromDb.fqdns.join('\n'),
      SIRET_par_defaut: identityProviderFromDb.siret,
      Alg_ID_token: identityProviderFromDb.id_token_signed_response_alg || '',
      Alg_userinfo: identityProviderFromDb.userinfo_signed_response_alg || '',
      Routage_active: identityProviderFromDb.isRoutingEnabled ? 'Oui' : 'Non',
    };
  }

  private transformServiceProviderToGristRecord(
    serviceProvider: ServiceProviderFromDb,
  ): ServiceProviderGristRecord {
    const { gristNetworkName, gristEnvironmentName } = this.config.get('grist');
    return {
      Reseau: gristNetworkName,
      Environnement: gristEnvironmentName,
      UID: serviceProvider.key,
      Nom: serviceProvider.name,
      Actif: serviceProvider.active ? 'Oui' : 'Non',
      Accepte_le_prive: serviceProvider.type === 'private' ? 'Oui' : 'Non',
      Liste_des_URL_de_callback: serviceProvider.redirect_uris.join('\n'),
      Liste_des_URL_de_logout:
        serviceProvider.post_logout_redirect_uris.join('\n'),
      Alg_ID_token: serviceProvider.id_token_signed_response_alg || '',
      Alg_userinfo: serviceProvider.userinfo_signed_response_alg || '',
      Scopes: serviceProvider.scopes.join(', '),
    };
  }

  private async publish(
    records: IdentityProviderGristRecord[] | ServiceProviderGristRecord[],
    tableId: string,
  ) {
    const { gristDomain, gristDocId, gristApiKey } = this.config.get('grist');
    const gristDocUrl = `https://${gristDomain}/api/docs/${gristDocId}/tables/${tableId}/records`;
    const recordUpdates = records.map((record) => ({
      fields: record,
      require: {
        UID: record.UID,
        Reseau: record.Reseau,
        Environnement: record.Environnement,
      },
    }));

    try {
      await fetch(gristDocUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${gristApiKey}`,
        },
        body: JSON.stringify({ records: recordUpdates }),
      });
    } catch (error) {
      this.logger.error(
        'Error during PUT request to Grist:',
        error?.response?.data
          ? JSON.stringify(error.response.data)
          : error.message,
      );
      return false;
    }
    return true;
  }
}
