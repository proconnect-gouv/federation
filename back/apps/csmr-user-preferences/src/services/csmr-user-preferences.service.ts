import { Injectable } from '@nestjs/common';

import { AccountNotFoundException, AccountService } from '@fc/account';
import { PartialExcept } from '@fc/common';
import { CryptographyFcpService, IPivotIdentity } from '@fc/cryptography-fcp';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerLevelNames, LoggerService } from '@fc/logger';
import { IdentityProviderMetadata, IOidcIdentity } from '@fc/oidc';

import { CsmrUserPreferencesIdpNotFoundException } from '../exceptions';
import { IIdpSettings } from '../interfaces';

@Injectable()
export class CsmrUserPreferencesService {
  constructor(
    private readonly logger: LoggerService,
    private readonly account: AccountService,
    private readonly cryptographyFcp: CryptographyFcpService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  formatUserIdpSettingsList(
    identityProvidersMetadata: IdentityProviderMetadata[],
    includeList: string[] = [],
  ): IIdpSettings[] {
    return identityProvidersMetadata
      .filter((idp) => idp.display)
      .map(
        (idp) =>
          ({
            uid: idp.uid,
            name: idp.name,
            image: idp.image,
            title: idp.title,
            active: idp.active,
            isChecked: !includeList.length || includeList.includes(idp.uid),
          } as IIdpSettings),
      );
  }

  async getIdpSettings(
    identity: IOidcIdentity | PartialExcept<IOidcIdentity, 'sub'>,
  ): Promise<IIdpSettings[]> {
    this.logger.debug(`Identity received : ${identity}`);
    const identityHash = this.cryptographyFcp.computeIdentityHash(
      identity as IPivotIdentity,
    );
    const { id, idpSettings } = await this.account.getAccountByIdentityHash(
      identityHash,
    );
    if (!id) {
      this.logger.trace(
        { error: 'No account found', identityHash },
        LoggerLevelNames.WARN,
      );
      throw new AccountNotFoundException();
    }

    const idpListMetadata = await this.identityProvider.getList();
    const formattedIdpSettings = this.formatUserIdpSettingsList(
      idpListMetadata,
      idpSettings?.includeList,
    );

    this.logger.trace({
      accountId: id,
      identity,
      identityHash,
      idpSettings: idpSettings,
      formattedIdpSettings,
    });

    return formattedIdpSettings;
  }

  async setIdpSettings(
    identity: IPivotIdentity,
    includeList: string[],
  ): Promise<IIdpSettings[]> {
    this.logger.debug(`Identity received : ${identity}`);

    const idpListMetadata = await this.identityProvider.getList();
    const identityProviderUids = idpListMetadata.map(
      (metadata) => metadata.uid,
    );
    const areIdentityProvidersInMetadata = includeList.every((idpUid) =>
      identityProviderUids.includes(idpUid),
    );
    if (!areIdentityProvidersInMetadata) {
      this.logger.trace(
        {
          error:
            'includeList in parameters contains idp uid that does not exist',
        },
        LoggerLevelNames.WARN,
      );

      throw new CsmrUserPreferencesIdpNotFoundException();
    }

    this.logger.debug(`includeList received : ${includeList}`);
    const identityHash = this.cryptographyFcp.computeIdentityHash(identity);
    const { id, idpSettings } = await this.account.updateIdpSettings(
      identityHash,
      includeList,
    );
    if (!id) {
      this.logger.trace(
        { error: 'No account found', identityHash },
        LoggerLevelNames.WARN,
      );

      throw new AccountNotFoundException();
    }

    const formattedIdpSettings = this.formatUserIdpSettingsList(
      idpListMetadata,
      idpSettings.includeList,
    );

    this.logger.trace({
      accountId: id,
      identity,
      identityHash,
      includeList,
      formattedIdpSettings,
      idpSettings: idpSettings,
    });

    return formattedIdpSettings;
  }
}
