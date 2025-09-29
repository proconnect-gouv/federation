import { Request, Response } from 'express';
import { isEmpty, uniq } from 'lodash';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core/dto';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { TrackedEvent } from '@fc/tracking/enums/tracked-event.enum';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaIdpConfigurationException,
  CoreFcaUnauthorizedEmailException,
} from '../exceptions';
import { CoreFcaFqdnService } from './core-fca-fqdn.service';

@Injectable()
export class CoreFcaService {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcAcr: OidcAcrService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly session: SessionService,
    private readonly fqdnService: CoreFcaFqdnService,
    private readonly logger: LoggerService,
    private readonly tracking: TrackingService,
  ) {}
  // eslint-disable-next-line complexity
  async redirectToIdp(
    req: Request,
    res: Response,
    idpId: string,
  ): Promise<void> {
    const { spId, login_hint, spName, rememberMe, inputEmail } =
      this.session.get<UserSession>('User');
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    await this.throwIfFqdnNotAuthorizedForSp(spId, login_hint);

    const selectedIdp = await this.safelyGetExistingAndEnabledIdp(idpId);

    const { nonce, state } =
      await this.oidcClient.utils.buildAuthorizeParameters();

    const authorizeParams: AuthorizationParameters = {
      state,
      nonce,
      scope,
      acr_values: null,
      claims: {
        id_token: {
          amr: null,
          acr: null,
        },
      },
      login_hint,
      sp_id: spId,
      sp_name: spName,
      remember_me: rememberMe,
    };

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const { acrValues, acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);

    if (acrClaims) {
      authorizeParams['claims']['id_token']['acr'] = acrClaims;
    } else if (acrValues) {
      authorizeParams['acr_values'] = acrValues;
    }

    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;

    // these specific behaviors are legacy implementations and should be homogenized in the future
    if (idpId === defaultIdpId) {
      authorizeParams['scope'] += ' is_service_public';
    } else if (!acrValues && !acrClaims) {
      authorizeParams['acr_values'] = 'eidas1';
    }

    const authorizationUrl = await this.oidcClient.utils.getAuthorizeUrl(
      idpId,
      authorizeParams,
    );

    const { name: idpName, title: idpLabel } = selectedIdp;

    const sessionPayload: UserSession = {
      idpId,
      idpName,
      idpLabel,
      idpNonce: nonce,
      idpState: state,
      idpIdentity: undefined,
      spIdentity: undefined,
      inputEmail: inputEmail ?? login_hint,
    };

    this.session.set('User', sessionPayload);

    await this.tracking.track(TrackedEvent.IDP_CHOSEN, { req });

    res.redirect(authorizationUrl);
  }

  /**
   * temporary code for resolving Uniforces issue
   */
  private async throwIfFqdnNotAuthorizedForSp(
    spId: string,
    email: string,
  ): Promise<void> {
    const authorizedFqdnsConfig =
      this.fqdnService.getSpAuthorizedFqdnsConfig(spId);

    if (!authorizedFqdnsConfig?.authorizedFqdns.length) return;

    const { fqdn: fqdnFromEmail } =
      await this.fqdnService.getFqdnConfigFromEmail(email);

    if (
      !authorizedFqdnsConfig.authorizedFqdns.some(
        (fqdnInConfig) => fqdnInConfig === fqdnFromEmail,
      )
    ) {
      this.logger.err(`Unauthorized fqdn ${fqdnFromEmail} for SP ${spId}`);
      throw new CoreFcaUnauthorizedEmailException(
        authorizedFqdnsConfig.spName,
        authorizedFqdnsConfig.spContact,
        authorizedFqdnsConfig.authorizedFqdns,
      );
    }
  }

  private async safelyGetExistingAndEnabledIdp(
    idpId: string,
  ): Promise<IdentityProviderMetadata> {
    const idp = await this.identityProvider.getById(idpId);

    if (isEmpty(idp)) {
      throw new CoreFcaIdpConfigurationException();
    }

    if (!idp.active) {
      throw new CoreFcaAgentIdpDisabledException();
    }

    return idp;
  }

  async getIdentityProvidersByIds(
    idpIds: string[],
  ): Promise<{ name: string; title: string; uid: string }[]> {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;
    const providers = await this.identityProvider.getList();

    // remove possible duplicate
    const uniqueDuplicateFreeIdpUids = uniq(idpIds);

    const filteredProviders = providers
      .filter(({ uid }) => uniqueDuplicateFreeIdpUids.includes(uid))
      .map(({ name, title, uid }) => ({
        name,
        title: uid === defaultIdpId ? 'Autre' : title, // rename default IdP to "Autre"
        uid,
      }));

    // sort providers by title alphabetically with "Autre" at the end of the list
    return filteredProviders.sort((a, b) => {
      if (a.title === 'Autre') return 1;
      if (b.title === 'Autre') return -1;
      return a.title.localeCompare(b.title, 'fr');
    });
  }

  hasDefaultIdp(providersUid: string[]): boolean {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;
    return providersUid.includes(defaultIdpId);
  }
}
