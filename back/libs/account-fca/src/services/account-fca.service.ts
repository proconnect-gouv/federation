import { filter, isEmpty, isEqual } from 'lodash';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/core/dto';

import { AccountFca } from '../schemas';

@Injectable()
export class AccountFcaService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel('AccountFca') private model: Model<AccountFca>,
  ) {}

  async getAccountBySub(sub: string) {
    return await this.model.findOne<AccountFca>({ sub });
  }

  async getAccountByIdpAgentKeys(idpSub: string, idpUid: string) {
    return await this.model.findOne<AccountFca>({
      idpIdentityKeys: {
        $elemMatch: {
          idpSub,
          idpUid,
        },
      },
    });
  }

  private async getReconciledAccount(idpUid: string, idpMail: string) {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;
    if (idpUid !== defaultIdpId) {
      return await this.model.findOne<AccountFca>({
        idpIdentityKeys: {
          $elemMatch: {
            // We lowercase the email because the email case might change across different identity providers
            // Note that this works because all emails from PCI (e.g. the default idp) are lowercase.
            // This approach is limited to matching identities from the default identity provider only.
            idpMail: idpMail.toLowerCase(),
            idpUid: defaultIdpId,
          },
        },
      });
    }
    return null;
  }

  createAccount(): AccountFca {
    const sub: string = uuid();
    return new this.model({ sub });
  }

  async upsertWithSub(account: AccountFca): Promise<void> {
    await this.model.findOneAndUpdate(
      {
        sub: account.sub,
      },
      account,
      { upsert: true },
    );
  }

  async getOrCreateAccount(idpUid: string, idpSub: string, idpMail: string) {
    const idpAgentKeys = { idpUid, idpSub };
    const idpFullKeys = { idpUid, idpSub, idpMail };

    let account = await this.getAccountByIdpAgentKeys(idpSub, idpUid);
    account = account || (await this.getReconciledAccount(idpUid, idpMail));
    account = account || this.createAccount();

    account.idpIdentityKeys = filter(
      account.idpIdentityKeys,
      ({ idpSub, idpUid }) => !isEqual({ idpSub, idpUid }, idpAgentKeys),
    );
    account.idpIdentityKeys.push(idpFullKeys);

    account.lastConnection = new Date();

    await this.upsertWithSub(account);

    return account;
  }

  async checkEmailExists(idpMail: string) {
    const account = await this.model.exists({
      idpIdentityKeys: { $elemMatch: { idpMail } },
    });
    return !isEmpty(account);
  }
}
