import { v4 as uuid } from 'uuid';

import { Injectable } from '@nestjs/common';

import { AccountFca, AccountFcaService, IIdpAgentKeys } from '@fc/account-fca';
import { CoreAcrService, IVerifyFeatureHandlerHandleArgument } from '@fc/core';
import { CoreFcaAgentAccountBlockedException } from '@fc/core-fca/exceptions/core-fca-account-blocked.exception';
import { IAgentIdentity } from '@fc/cryptography-fca';
import { FeatureHandler, IFeatureHandler } from '@fc/feature-handler';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IOidcIdentity } from '@fc/oidc';
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionService } from '@fc/session';

@Injectable()
@FeatureHandler('core-fca-default-verify')
export class CoreFcaDefaultVerifyHandler implements IFeatureHandler {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    protected readonly logger: LoggerService,
    protected readonly coreAcr: CoreAcrService,
    protected readonly identityProvider: IdentityProviderAdapterMongoService,
    protected readonly accountService: AccountFcaService,
  ) {}

  /**
   * Main business manipulations occurs in this method
   *
   * 1. Get infos on current interaction and identity fetched from IdP
   * 2. Store interaction with account service (long term storage)
   * 3. Store identity with session service (short term storage)
   *
   * @param req
   */
  async handle({
    sessionOidc,
  }: IVerifyFeatureHandlerHandleArgument): Promise<void> {
    this.logger.debug('verifyIdentity service: ##### core-fca-default-verify');

    const { idpId, idpIdentity, idpAcr, spAcr } = sessionOidc.get();

    // Acr check
    const { maxAuthorizedAcr } = await this.identityProvider.getById(idpId);

    this.coreAcr.checkIfAcrIsValid(idpAcr, spAcr, maxAuthorizedAcr);

    const agentIdentity = idpIdentity as IAgentIdentity;

    const account = await this.persistLongTermIdentity(agentIdentity, idpId);

    this.checkIfAccountIsBlocked(account);

    const fcaIdentity = this.composeFcaIdentity(agentIdentity, idpId, idpAcr);

    this.storeIdentityWithSessionService(
      sessionOidc,
      account.sub,
      fcaIdentity,
      account.id,
    );
  }

  protected async persistLongTermIdentity(
    agentIdentity: IAgentIdentity,
    idpUid: string,
  ): Promise<AccountFca> {
    // get agent key
    const idpAgentKey = this.getIdpAgentKey(idpUid, agentIdentity.sub);

    // check if account exists
    const existingAccount =
      await this.accountService.getAccountByIdpAgentKeys(idpAgentKey);
    let universalSub: string;

    if (existingAccount) {
      this.logger.info(
        `Account for idpId "${idpUid}" and sub "${agentIdentity.sub}" already exists`,
      );
      universalSub = existingAccount.sub;
    } else {
      this.logger.info(
        `Account for idpId "${idpUid}" and sub "${agentIdentity.sub}" does not exist, creating a new one`,
      );
      universalSub = uuid();
    }

    return await this.saveInteractionToDatabase(
      universalSub,
      idpAgentKey,
      existingAccount,
    );
  }

  // agentHash is a combination of idpId and idpSub
  protected getIdpAgentKey(idpUid: string, idpSub: string): IIdpAgentKeys {
    return {
      idpUid,
      idpSub,
    };
  }

  protected async saveInteractionToDatabase(
    sub: string,
    idpAgentKey: IIdpAgentKeys,
    existingAccount?: AccountFca,
  ): Promise<AccountFca> {
    const interaction = {
      // fca Hash is used as main identity hash
      idpUid: idpAgentKey.idpUid,
      idpSub: idpAgentKey.idpSub,
      // Set last connection time to now
      lastConnection: new Date(),
      sub,
    };

    return await this.accountService.saveInteraction(
      interaction,
      existingAccount,
    );
  }

  protected composeFcaIdentity(
    idpIdentity: IAgentIdentity,
    idpId: string,
    idpAcr: string,
  ): {
    // AgentConnect claims naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    idp_id: string;
    // AgentConnect claims naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    idp_acr: string;
  } & Omit<IAgentIdentity, 'sub'> {
    const { sub: _sub, ...spIdentityCleaned } = idpIdentity;

    return {
      ...spIdentityCleaned,
      // AgentConnect claims naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      idp_id: idpId,
      // AgentConnect claims naming convention
      // eslint-disable-next-line @typescript-eslint/naming-convention
      idp_acr: idpAcr,
    };
  }

  protected storeIdentityWithSessionService(
    sessionOidc: ISessionService<OidcClientSession>,
    sub: string,
    // AgentConnect claims naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    spIdentity: Partial<Omit<IOidcIdentity, 'sub'>>,
    accountId: string,
  ): void {
    const { idpIdentity, spId, amr, subs } = sessionOidc.get();

    const session: OidcClientSession = {
      amr,
      idpIdentity,
      spIdentity,
      accountId,
      subs: { ...subs, [spId]: sub },
    };

    sessionOidc.set(session);
  }

  protected checkIfAccountIsBlocked(account: AccountFca): void {
    if (!account.active) {
      throw new CoreFcaAgentAccountBlockedException();
    }
  }
}
