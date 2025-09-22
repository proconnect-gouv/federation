import { some } from 'lodash';
import { Model } from 'mongoose';
import { v4 as uuid } from 'uuid';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/core/dto';
import { CoreFcaAgentAccountBlockedException } from '../exceptions';
import { IIdpAgentKeys } from '../interfaces';
import { AccountFca } from '../schemas';

@Injectable()
export class AccountFcaService {
  constructor(
    private readonly config: ConfigService,
    @InjectModel('AccountFca') private model: Model<AccountFca>,
  ) {}

  async getAccountByIdpAgentKeys(
    idpIdentityKeys: IIdpAgentKeys,
  ): Promise<AccountFca> {
    return await this.model.findOne({
      idpIdentityKeys: {
        $elemMatch: {
          idpSub: idpIdentityKeys.idpSub,
          idpUid: idpIdentityKeys.idpUid,
        },
      },
    });
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

  async getOrCreateAccount(
    idpUid: string,
    idpSub: string,
    idpMail: string,
  ): Promise<AccountFca> {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;

    const idpAgentKeys = { idpUid, idpSub };
    const idpFullKeys = { idpUid, idpSub, idpMail };
    let account = await this.getAccountByIdpAgentKeys(idpAgentKeys);
    if (!account) {
      const pciAccount = await this.model.findOne({
        idpIdentityKeys: {
          $elemMatch: {
            idpMail,
            idpUid: defaultIdpId,
          },
        },
      });
      account = pciAccount || this.createAccount();
    }
    if (!account.active) {
      throw new CoreFcaAgentAccountBlockedException();
    }

    if (!some(account.idpIdentityKeys, idpFullKeys)) {
      account.idpIdentityKeys.push(idpFullKeys);
    }

    account.lastConnection = new Date();

    await this.upsertWithSub(account);

    return account;
  }
}
