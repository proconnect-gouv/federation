import { ModuleRef } from '@nestjs/core';
import { Injectable } from '@nestjs/common';
import { LoggerLevelNames, LoggerService } from '@fc/logger';
import { ISessionGenericService } from '@fc/session-generic';
import { OidcSession } from '@fc/oidc';
import { OidcClientSession } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { CoreMissingAuthenticationEmailException } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { ScopesService } from '@fc/scopes';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { CoreFcpSendEmailHandler } from '../handlers';
import {
  FeatureHandler,
  IFeatureHandler,
  IFeatureHandlerDatabaseMap,
} from '@fc/feature-handler';
import { ProcessCore } from '../enums';
import { IVerifyFeatureHandler } from '../interfaces';

export type FcpFeature = {
  featureHandlers: IFeatureHandlerDatabaseMap<ProcessCore>;
};

@Injectable()
export class CoreFcpService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    public readonly moduleRef: ModuleRef,
    private readonly scopes: ScopesService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Main business manipulations occurs in this method
   *
   * @param {ISessionGenericService<OidcClientSession>} sessionOidc
   * @returns {Promise<void>}
   */
  async verify(
    sessionOidc: ISessionGenericService<OidcClientSession>,
    trackingContext: Record<string, any>,
  ): Promise<void> {
    this.logger.debug('CoreFcpService.verify');

    const { idpId } = await sessionOidc.get();

    const verifyHandler: IVerifyFeatureHandler = await this.getFeature<void>(
      idpId,
      ProcessCore.CORE_VERIFY,
    );

    this.logger.trace({ idpId, trackingContext });

    return await verifyHandler.handle({ sessionOidc, trackingContext });
  }

  async getFeature<T>(
    idpId: string,
    process: ProcessCore,
  ): Promise<IFeatureHandler<T>> {
    this.logger.debug(`getFeature ${process} for provider: ${idpId}`);

    const idp = await this.identityProvider.getById<FcpFeature>(idpId);
    const idClass = idp.featureHandlers[process];

    this.logger.trace({ idp, idClass });

    return FeatureHandler.get(idClass, this);
  }

  /**
   * Send an email to the authenticated end-user after consent.
   *
   * @param {ISessionGenericService<OidcClientSession>} sessionOidc
   * @returns {Promise<void>}
   */
  async sendAuthenticationMail(session: OidcSession): Promise<void> {
    this.logger.debug('CoreFcpService.sendAuthenticationMail()');

    const { idpId } = session;
    const idp = await this.identityProvider.getById(idpId);

    let handler: CoreFcpSendEmailHandler;
    try {
      const { authenticationEmail } = idp.featureHandlers;
      handler = await FeatureHandler.get(authenticationEmail, this);
    } catch (error) {
      this.logger.trace({ error }, LoggerLevelNames.WARN);
      throw new CoreMissingAuthenticationEmailException(error);
    }

    this.logger.trace({ idpId, idp });

    await handler.handle(session);
  }

  async isConsentRequired(spId: string): Promise<boolean> {
    const { type, identityConsent } = await this.serviceProvider.getById(spId);

    const consentRequired = this.serviceProvider.consentRequired(
      type,
      identityConsent,
    );

    this.logger.trace({ consentRequired });

    return consentRequired;
  }

  /**
   * @todo type input, needs typing on the return of OidcProviderService.getInteraction()
   */
  async getClaimsLabelsForInteraction(interaction: any): Promise<string[]> {
    const scopes = this.getScopesForInteraction(interaction);

    const claims = await this.scopes.mapScopesToLabel(scopes);

    this.logger.trace({ interaction, claims });

    return claims;
  }

  /**
   * @todo type input, needs typing on the return of OidcProviderService.getInteraction()
   */
  async getClaimsForInteraction(interaction: any): Promise<string[]> {
    const scopes = this.getScopesForInteraction(interaction);

    const claims = await this.scopes.getClaimsFromScopes(scopes);

    this.logger.trace({ interaction, claims });

    return claims;
  }

  /**
   * @todo type input, needs typing on the return of OidcProviderService.getInteraction()
   */
  getScopesForInteraction(interaction: any): string[] {
    const {
      params: { scope },
    } = interaction;
    const scopes = scope.split(' ');

    this.logger.trace({ interaction, scopes });

    return scopes;
  }

  async rejectInvalidAcr(
    currentAcrValue: string,
    allowedAcrValues: string[],
    { req, res }: { req: any; res: any },
  ): Promise<boolean> {
    const isAllowed = allowedAcrValues.includes(currentAcrValue);

    if (isAllowed) {
      this.logger.trace({ isAllowed, currentAcrValue, allowedAcrValues });
      return false;
    }

    const error = 'invalid_acr';
    const allowedAcrValuesString = allowedAcrValues.join(',');
    const errorDescription = `acr_value is not valid, should be equal one of these values, expected ${allowedAcrValuesString}, got ${currentAcrValue}`;

    await this.oidcProvider.abortInteraction(req, res, error, errorDescription);

    this.logger.trace(
      { isAllowed, currentAcrValue, allowedAcrValues },
      LoggerLevelNames.WARN,
    );

    return true;
  }
}
