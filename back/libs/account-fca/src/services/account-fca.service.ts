import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { IIdpAgentKeys, IInteraction } from '../interfaces';
import { AccountFca } from '../schemas';

@Injectable()
export class AccountFcaService {
  constructor(@InjectModel('AccountFca') private model: Model<AccountFca>) {}

  async saveInteraction(
    interaction: IInteraction,
    existingAccount?: AccountFca,
  ): Promise<AccountFca> {
    const account = this.getAccountWithSub(interaction, existingAccount);
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

  private getAccountWithSub(
    { sub, lastConnection, idpSub, idpUid }: Omit<IInteraction, 'id'>,
    existingAccount?: AccountFca,
  ): AccountFca {
    let account = existingAccount;

    if (!account) {
      account = new this.model({ sub });
      account.idpIdentityKeys = [{ idpSub, idpUid }];
    }

    // Updating last connection timestamp updates session lifetime
    account.lastConnection = lastConnection;

    return account;
  }
}
