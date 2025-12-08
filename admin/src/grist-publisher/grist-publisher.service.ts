import { Injectable } from '@nestjs/common';
import { ConfigService } from 'nestjs-config';
import { isString } from 'lodash';
import { LoggerService } from '../logger/logger.service';
import { IdentityProviderFromDb } from '../identity-provider/identity-provider.mongodb.entity';
import { ServiceProviderFromDb } from '../service-provider/service-provider.mongodb.entity';
import { IdentityProviderGristRecord } from './interface/identity-provider-grist-record.interface';
import { ServiceProviderGristRecord } from './interface/service-provider-grist-record.interface';
import { GristRecord } from './interface/grist-record.interface';

@Injectable()
export class GristPublisherService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
  ) {}

  async publishServiceProviders(serviceProviders: ServiceProviderFromDb[]) {
    const { gristServiceProvidersTableId } = this.config.get('grist');
    const previousServiceProviderRecords =
      await this.getProviderRecordsFromGrist<ServiceProviderGristRecord>(
        gristServiceProvidersTableId,
      );

    const nextServiceProviderRecords = serviceProviders.map((serviceProvider) =>
      this.transformServiceProviderToGristRecord(serviceProvider),
    );

    const { recordIdsToDelete, recordsToUpsert } = this.computeRecordUpdates(
      previousServiceProviderRecords,
      nextServiceProviderRecords,
    );

    return this.publish(
      { recordIdsToDelete, recordsToUpsert },
      gristServiceProvidersTableId,
    );
  }

  async publishIdentityProviders(identityProviders: IdentityProviderFromDb[]) {
    const { gristIdentityProvidersTableId } = this.config.get('grist');

    const previousIdentityProviderRecords =
      await this.getProviderRecordsFromGrist<IdentityProviderGristRecord>(
        gristIdentityProvidersTableId,
      );

    const nextIdentityProviderRecords = identityProviders.map(
      (identityProvider) =>
        this.transformIdentityProviderToGristRecord(identityProvider),
    );

    const { recordIdsToDelete, recordsToUpsert } = this.computeRecordUpdates(
      previousIdentityProviderRecords,
      nextIdentityProviderRecords,
    );

    return this.publish(
      { recordIdsToDelete, recordsToUpsert },
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
      URL_de_decouverte: isString(identityProviderFromDb.discoveryUrl)
        ? identityProviderFromDb.discoveryUrl
        : '',
      Liste_des_FQDN: identityProviderFromDb.fqdns.join('\n'),
      SIRET_par_defaut: identityProviderFromDb.siret,
      Alg_ID_token: identityProviderFromDb.id_token_signed_response_alg || '',
      Alg_userinfo: identityProviderFromDb.userinfo_signed_response_alg || '',
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

  private computeRecordUpdates<
    providerT extends { UID: string; Reseau: string; Environnement: string },
  >(
    previousGristRecords: GristRecord<providerT>[],
    nextProviderRecords: providerT[],
  ) {
    const recordIdsToDelete: number[] = [];
    const recordsToUpsert: providerT[] = [];
    for (const previousProviderRecord of previousGristRecords) {
      const stillExists = nextProviderRecords.some(
        (nextRecord) =>
          nextRecord.UID === previousProviderRecord.fields.UID &&
          nextRecord.Reseau === previousProviderRecord.fields.Reseau &&
          nextRecord.Environnement ===
            previousProviderRecord.fields.Environnement,
      );
      if (!stillExists) {
        this.logger.info(
          `Deleting record: ${previousProviderRecord.fields.UID}`,
        );
        recordIdsToDelete.push(previousProviderRecord.id);
      }
    }

    for (const nextProviderRecord of nextProviderRecords) {
      const previousRecord = previousGristRecords.find(
        (prevRecord) =>
          prevRecord.fields.UID === nextProviderRecord.UID &&
          prevRecord.fields.Reseau === nextProviderRecord.Reseau &&
          prevRecord.fields.Environnement === nextProviderRecord.Environnement,
      );
      if (!previousRecord) {
        this.logger.info(`Adding record: ${nextProviderRecord.UID}`);

        recordsToUpsert.push(nextProviderRecord);
      } else {
        const hasChanges = Object.keys(nextProviderRecord).some(
          (key) =>
            nextProviderRecord[key as keyof providerT] !==
            previousRecord.fields[key as keyof providerT],
        );
        if (hasChanges) {
          this.logger.info(`Updating record: ${nextProviderRecord.UID}`);

          recordsToUpsert.push(nextProviderRecord);
        }
      }
    }

    return { recordIdsToDelete, recordsToUpsert };
  }

  private async publish<
    providerT extends { UID: string; Reseau: string; Environnement: string },
  >(
    {
      recordIdsToDelete,
      recordsToUpsert,
    }: {
      recordIdsToDelete: number[];
      recordsToUpsert: providerT[];
    },
    tableId: string,
  ) {
    const successes = await Promise.all([
      this.deleteGristRecords(recordIdsToDelete, tableId),
      this.upsertGristRecords(recordsToUpsert, tableId),
    ]);

    return successes.every((success) => success);
  }

  private async getProviderRecordsFromGrist<providerT>(tableId: string) {
    const {
      gristDomain,
      gristDocId,
      gristApiKey,
      gristNetworkName,
      gristEnvironmentName,
    } = this.config.get('grist');
    const gristDocUrl = `https://${gristDomain}/api/docs/${gristDocId}/tables/${tableId}/records`;
    const queryParams = new URLSearchParams({
      filter: JSON.stringify({
        Reseau: [gristNetworkName],
        Environnement: [gristEnvironmentName],
      }),
    });
    const response = await fetch(`${gristDocUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${gristApiKey}`,
      },
    });

    const data = await response.json();

    return data.records as GristRecord<providerT>[];
  }

  private async deleteGristRecords(recordIds: number[], tableId: string) {
    if (recordIds.length === 0) {
      return true;
    }
    const { gristDomain, gristDocId, gristApiKey } = this.config.get('grist');
    const gristDocUrl = `https://${gristDomain}/api/docs/${gristDocId}/tables/${tableId}/records/delete`;
    try {
      const deleteResponse = await fetch(`${gristDocUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gristApiKey}`,
        },
        body: JSON.stringify(recordIds),
      });
      if (deleteResponse.ok) {
        return true;
      } else {
        const responseText = await deleteResponse.text();

        this.logger.error(
          `Could not delete Grist records: ${deleteResponse.statusText} (${responseText})`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(`Could not delete records from Grist: ${error}`);
      return false;
    }
  }

  private async upsertGristRecords<
    providerT extends { UID: string; Reseau: string; Environnement: string },
  >(records: providerT[], tableId: string) {
    if (records.length === 0) {
      return true;
    }
    const MAX_RECORDS_PER_REQUEST = 100;
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

    for (let i = 0; i < recordUpdates.length; i += MAX_RECORDS_PER_REQUEST) {
      const recordUpdatesChunk = recordUpdates.slice(
        i,
        i + MAX_RECORDS_PER_REQUEST,
      );
      const success = await this.performGristUpsertRequest<providerT>({
        gristDocUrl,
        gristApiKey,
        recordUpdates: recordUpdatesChunk,
      });
      if (!success) {
        return false;
      }
    }

    return true;
  }

  private async performGristUpsertRequest<providerT>({
    gristDocUrl,
    gristApiKey,
    recordUpdates,
  }: {
    gristDocUrl: string;
    gristApiKey: string;
    recordUpdates: Array<{
      fields: providerT;
      require: { UID: string; Reseau: string; Environnement: string };
    }>;
  }) {
    this.logger.info(`Upserting ${recordUpdates.length} records to Grist...`);
    try {
      const response = await fetch(gristDocUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${gristApiKey}`,
        },
        body: JSON.stringify({ records: recordUpdates }),
      });

      if (response.ok) {
        return true;
      } else {
        const responseText = await response.text();
        this.logger.error(
          `Could not update Grist: ${response.statusText} (${responseText})`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(`Could not update Grist: ${error}`);
      return false;
    }
  }
}
