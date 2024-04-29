import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { IIdpAgentKeys, IInteraction } from '../interfaces';
import { AccountFca } from '../schemas';

@Injectable()
export class AccountFcaService {
  constructor(@InjectModel('AccountFca') private model: Model<AccountFca>) {}

  isBlocked(account: AccountFca): boolean {
    return !account.active;
  }

  async saveInteraction(interaction: IInteraction): Promise<AccountFca> {
    const account = await this.getAccountWithSub(interaction);
    await account.save();

    return account;
  }

  async getAccountByIdpAgentKeys(
    idpIdentityKeys: IIdpAgentKeys,
  ): Promise<AccountFca> {
    return await this.model.findOne({
      idpIdentityKeys: {
        idpSub: idpIdentityKeys.idpSub,
        idpUid: idpIdentityKeys.idpUid,
      },
    });
  }

  private async getAccountWithSub({
    sub,
    lastConnection,
    idpSub,
    idpUid,
  }: Omit<IInteraction, 'id'>): Promise<AccountFca> {
    // Get existing account or declare a new one
    let account = await this.model.findOne({ sub });

    if (!account) {
      account = new this.model({ sub });
      account.idpIdentityKeys = [{ idpSub, idpUid }];
    }

    // Update last connection timestamp
    account.lastConnection = lastConnection;

    return account;
  }
}
