import { Injectable } from '@nestjs/common';

import { Account, AccountBlockedException, AccountService } from '@fc/account';
import { PartialExcept, RequiredExcept } from '@fc/common';
import { ConfigService } from '@fc/config';
import { CoreAccountService, CoreAcrService } from '@fc/core';
import { CryptographyFcpService } from '@fc/cryptography-fcp';
import { FeatureHandler } from '@fc/feature-handler';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IOidcIdentity } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientSession } from '@fc/oidc-client';
import { RnippPivotIdentity, RnippService } from '@fc/rnipp';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService } from '@fc/session';
import { TrackedEventContextInterface, TrackingService } from '@fc/tracking';

import { CoreConfig } from '../../dto';
import { IdentitySource } from '../../enums';
import {
  IVerifyFeatureHandler,
  IVerifyFeatureHandlerHandleArgument,
} from '../../interfaces';

@Injectable()
@FeatureHandler('core-fcp-default-verify')
export class CoreFcpDefaultVerifyHandler implements IVerifyFeatureHandler {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    protected readonly logger: LoggerService,
    protected readonly coreAccount: CoreAccountService,
    protected readonly coreAcr: CoreAcrService,
    protected readonly config: ConfigService,
    protected readonly tracking: TrackingService,
    protected readonly rnipp: RnippService,
    protected readonly serviceProvider: ServiceProviderAdapterMongoService,
    protected readonly cryptographyFcp: CryptographyFcpService,
    protected readonly account: AccountService,
    protected readonly identityProvider: IdentityProviderAdapterMongoService,
    protected readonly oidcAcr: OidcAcrService,
  ) {}

  /**
   * Main business manipulations occurs in this method
   *
   * 1. Get infos on current interaction and identity fetched from IdP
   * 2. Check identity against RNIPP
   * 3. Store interaction with account service (long term storage)
   * 4. Find which identity should be sent to the Sp (either Rnipp or IdP)
   * 5. Store identity with session service (short term storage)
   * 6. Display consent page
   * @param req
   */
  async handle({
    sessionOidc,
    trackingContext,
  }: IVerifyFeatureHandlerHandleArgument): Promise<void> {
    this.logger.debug('getConsent service: ##### core-fcp-default-verify');

    // Grab informations on interaction and identity
    const { idpAcr, idpId, idpIdentity, spAcr, spId, isSso, subs } =
      sessionOidc.get();

    /**
     * @todo #410 - le DTO est permissif et devrait forcer les données
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/410
     * if (!idpId || !idpIdentity) {
     *   throw new CoreMissingInteraction('identity provider');
     * }
     * if (!spIdentity || !spId) {
     *   throw new CoreMissingInteraction('service provider');
     * }
     */

    // 1. Acr check
    const { allowedAcr } = await this.identityProvider.getById(idpId);

    this.coreAcr.checkIfAcrIsValid(idpAcr, spAcr, allowedAcr);
    const interactionAcr = this.oidcAcr.getInteractionAcr({
      idpAcr,
      spAcr,
      isSso,
    });

    const rnippIdentity = await this.retrieveRnippIdentity(
      isSso,
      sessionOidc,
      idpIdentity as IOidcIdentity,
      trackingContext,
    );

    const identityHash =
      this.cryptographyFcp.computeIdentityHash(rnippIdentity);

    const account = await this.account.getAccountByIdentityHash(identityHash);

    // 2. Account activeCheck (account)
    this.checkAccountBlocked(account);

    // 3. IdpBLocked check (account)
    this.coreAccount.checkIfIdpIsBlockedForAccount(account, idpId);

    const { entityId } = await this.serviceProvider.getById(spId);

    const sub = this.getSub(account, identityHash, entityId);

    // 5. Save interaction to database & get sp's sub to avoid double computation
    const accountId = await this.coreAccount.computeFederation({
      key: entityId,
      identityHash,
      sub,
    });

    const spIdentity = this.buildSpIdentity(idpIdentity, rnippIdentity);
    const technicalClaims = this.getTechnicalClaims(idpId);

    const session: OidcClientSession = {
      idpIdentity,
      rnippIdentity,
      interactionAcr,
      spIdentity: {
        ...spIdentity,
        ...technicalClaims,
      },
      accountId,
      subs: { ...subs, [spId]: sub },
    };

    sessionOidc.set(session);
  }

  private getTechnicalClaims(idpId: string): Record<string, unknown> {
    return {
      idp_id: idpId,
    };
  }

  private checkAccountBlocked(account: Account): void {
    if (account.active === false) {
      throw new AccountBlockedException();
    }
  }

  private getSub(
    account: Account,
    identityHash: string,
    entityId: string,
  ): string {
    let sub: string;
    if (account.spFederation?.hasOwnProperty(entityId)) {
      this.logger.info('using existing sub from spFederation');
      const subData = account.spFederation[entityId];
      sub = typeof subData === 'string' ? subData : subData.sub;
    } else {
      this.logger.info('creating new sub');
      sub = this.cryptographyFcp.computeSubV1(entityId, identityHash);
    }
    this.logger.debug({ sub });

    return sub;
  }

  /**
   *
   * @param idpIdentity
   * @param req
   */
  private async rnippCheck(
    idpIdentity: RequiredExcept<
      IOidcIdentity,
      'sub' | 'email' | 'preferred_username' | 'rep_scope'
    >,
    trackingContext: any,
  ): Promise<RnippPivotIdentity> {
    const { FC_REQUESTED_RNIPP, FC_RECEIVED_VALID_RNIPP } =
      this.tracking.TrackedEventsMap;

    await this.tracking.track(FC_REQUESTED_RNIPP, trackingContext);
    const rnippIdentity = await this.rnipp.check(idpIdentity);
    await this.tracking.track(FC_RECEIVED_VALID_RNIPP, trackingContext);

    return rnippIdentity;
  }

  private buildRnippClaims(
    rnippIdentity: RnippPivotIdentity,
  ): Partial<RnippPivotIdentity> {
    const rnippClaims = Object.fromEntries(
      Object.entries(rnippIdentity).map(([key, value]) => [
        `rnipp_${key}`,
        value,
      ]),
    );

    return rnippClaims;
  }

  private buildSpIdentity(
    idpIdentity: PartialExcept<IOidcIdentity, 'sub'>,
    rnippIdentity: RnippPivotIdentity,
  ): Partial<Omit<IOidcIdentity, 'sub'>> {
    const { useIdentityFrom } = this.config.get<CoreConfig>('Core');

    switch (useIdentityFrom) {
      case IdentitySource.RNIPP:
        return this.buildFromRnippIdentity(rnippIdentity, idpIdentity);
      case IdentitySource.IDP:
        return this.buildFromIdpIdentity(idpIdentity, rnippIdentity);
    }
  }

  /**
   * For Sp to handle properly users with birthdate as YYYY-MM or YYYY
   * we need to provide the idp birthdate not completed with "01" by default
   */
  private buildFromRnippIdentity(
    rnippIdentity: RnippPivotIdentity,
    idpIdentity: PartialExcept<IOidcIdentity, 'sub'>,
  ): Partial<Omit<IOidcIdentity, 'sub'>> {
    const { birthdate, email, preferred_username } = idpIdentity;
    return {
      ...rnippIdentity,
      idp_birthdate: birthdate,
      email,
      preferred_username,
    };
  }

  private buildFromIdpIdentity(
    idpIdentity: PartialExcept<IOidcIdentity, 'sub'>,
    rnippIdentity: RnippPivotIdentity,
  ): Partial<Omit<IOidcIdentity, 'sub'>> {
    const rnippClaims: Partial<RnippPivotIdentity> =
      this.buildRnippClaims(rnippIdentity);

    /**
     * Prepare identity that will be retrieved by `oidc-provider`
     * and sent to the SP
     *
     * We need to replace IdP's sub, by our own sub
     */
    // oidc claim
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { given_name_array } = rnippIdentity;
    return {
      ...idpIdentity,
      ...rnippClaims,
      // oidc claims
      // eslint-disable-next-line @typescript-eslint/naming-convention
      given_name_array,
    };
  }

  private async retrieveRnippIdentity(
    isSso: boolean,
    sessionOidc: ISessionService<OidcClientSession>,
    idpIdentity: IOidcIdentity,
    trackingContext: TrackedEventContextInterface,
  ): Promise<RnippPivotIdentity> {
    let rnippIdentity: RnippPivotIdentity;

    if (isSso) {
      rnippIdentity = sessionOidc.get('rnippIdentity');
    } else {
      // Identity check and normalization
      rnippIdentity = await this.rnippCheck(idpIdentity, trackingContext);
    }

    return rnippIdentity;
  }
}
