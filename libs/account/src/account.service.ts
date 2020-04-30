import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoggerService } from '@fc/logger';
import { IAccount, IInteraction } from './interfaces';

@Injectable()
export class AccountService {
  constructor(
    private readonly logger: LoggerService,
    @InjectModel('Account') private model: Model<IAccount>,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Save interaction to database
   *
   * @param interaction
   */
  async storeInteraction(interaction: IInteraction): Promise<void> {
    this.logger.debug('Save interaction to database');

    const account = await this.getAccountWithInteraction(interaction);

    account.save();
  }

  /**
   * Create an account object (model instance)
   * with data up to date with given interaction.
   *
   * Previous interactions are
   *  - preserved if provider is different
   *  - updated when provider is the same (though sub should not change)
   *
   * @param interaction
   * @returns an up to date account object
   */
  private async getAccountWithInteraction(
    interaction: IInteraction,
  ): Promise<Model<IAccount>> {
    const { identityHash } = interaction;

    // Get existing account or create one
    let account = await this.model.findOne({ identityHash });

    if (!account) {
      account = new this.model({ identityHash });
    }

    // Spread new interactions
    account.idpFederation = {
      ...account.idpFederation,
      ...interaction.idpFederation,
    };

    account.spFederation = {
      ...account.spFederation,
      ...interaction.spFederation,
    };

    // Update last connection timestamp
    account.lastConnection = interaction.lastConnection;

    return account;
  }
}
