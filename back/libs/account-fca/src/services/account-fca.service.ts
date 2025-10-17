import { filter, isEmpty, isEqual } from 'lodash';
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

  private async getReconciledAccount(
    idpUid: string,
    idpMail: string,
  ): Promise<AccountFca> {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;
    if (idpUid !== defaultIdpId) {
      return await this.model.findOne({
        idpIdentityKeys: {
          $elemMatch: {
            idpMail,
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

  async getOrCreateAccount(
    idpUid: string,
    idpSub: string,
    idpMail: string,
  ): Promise<AccountFca> {
    const idpAgentKeys = { idpUid, idpSub };
    const idpFullKeys = { idpUid, idpSub, idpMail };

    let account = await this.getAccountByIdpAgentKeys(idpAgentKeys);
    account = account || (await this.getReconciledAccount(idpUid, idpMail));
    account = account || this.createAccount();

    if (!account.active) {
      throw new CoreFcaAgentAccountBlockedException();
    }

    account.idpIdentityKeys = filter(
      account.idpIdentityKeys,
      ({ idpSub, idpUid }) => !isEqual({ idpSub, idpUid }, idpAgentKeys),
    );
    account.idpIdentityKeys.push(idpFullKeys);

    account.lastConnection = new Date();

    await this.upsertWithSub(account);

    return account;
  }

  async checkEmailExists(idpMail: string): Promise<boolean> {
    const account = await this.model.exists({
      idpIdentityKeys: { $elemMatch: { idpMail } },
    });
    return !isEmpty(account);
  }
}
