import { Request, Response } from 'express';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import {
  AfterGetInteractionSessionDto,
  AfterRedirectToIdpWithEmailSessionDto,
  AppConfig,
  UserSession,
} from '@fc/core/dto';
import { Routes } from '@fc/core/enums';
import { CoreFcaAgentNoIdpException } from '@fc/core/exceptions';
import { CoreFcaService } from '@fc/core/services/core-fca.service';
import { EmailValidatorService } from '@fc/email-validator/services';
import { LoggerService, TrackedEvent } from '@fc/logger';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';

@Injectable()
export class CoreFcaControllerService {
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcAcr: OidcAcrService,
    private readonly session: SessionService,
    private readonly coreFcaService: CoreFcaService,
    private readonly emailValidatorService: EmailValidatorService,
    private readonly logger: LoggerService,
  ) {}

  async redirectToIdpWithEmail(
    req: Request,
    res: Response,
    email: string,
    rememberMe: boolean,
  ): Promise<void> {
    this.session.set('User', { rememberMe: rememberMe, idpLoginHint: email });

    const { isEmailValid, suggestion } =
      await this.emailValidatorService.validate(email);

    if (!isEmailValid) {
      const { uid: interactionId } = await this.oidcProvider.getInteraction(
        req,
        res,
      );
      const { urlPrefix } = this.config.get<AppConfig>('App');
      let url = `${urlPrefix}${Routes.INTERACTION.replace(
        ':uid',
        interactionId,
      )}?error=invalid_email&user_email=${encodeURIComponent(email)}`;

      if (!!suggestion) {
        url += `&email_suggestion=${encodeURIComponent(suggestion)}`;
      }
      this.logger.warn({
        code: 'email_not_safe_to_send',
        emailSuggestion: suggestion,
        emailSuggestionFqdn: suggestion?.split('@').pop().toLowerCase(),
      });
      return res.redirect(url);
    }

    const idpsFromEmail = await this.coreFcaService.selectIdpsFromEmail(email);

    if (idpsFromEmail.length === 0) {
      const { spName } =
        this.session.get<AfterGetInteractionSessionDto>('User');

      throw new CoreFcaAgentNoIdpException(spName, email);
    }

    if (idpsFromEmail.length > 1) {
      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${Routes.IDENTITY_PROVIDER_SELECTION}`;

      return res.redirect(url);
    }

    return this.redirectToIdpWithIdpId(req, res, idpsFromEmail[0].uid);
  }

  async redirectToIdpWithIdpId(
    req: Request,
    res: Response,
    idpId: string,
  ): Promise<void> {
    const { spId, idpLoginHint, spName, spSiretHint, rememberMe } =
      this.session.get<AfterRedirectToIdpWithEmailSessionDto>('User');

    const idp = await this.coreFcaService.safelyGetExistingAndEnabledIdp(idpId);

    const entraConfig = { scope: 'openid email profile' };
    const { scope } = idp.isEntraID
      ? entraConfig
      : this.config.get<OidcClientConfig>('OidcClient');

    this.coreFcaService.ensureEmailIsAuthorizedForSp(spId, idpLoginHint);

    const selectedIdp =
      await this.coreFcaService.safelyGetExistingAndEnabledIdp(idpId);

    const { nonce, state } =
      await this.oidcClient.utils.buildAuthorizeParameters();

    const authorizeParams: AuthorizationParameters = {
      state,
      nonce,
      scope,
      acr_values: null,
      login_hint: idpLoginHint,
      siret_hint: spSiretHint,
      sp_id: spId,
      sp_name: spName,
      remember_me: rememberMe,
    };
    const claims = {
      id_token: {
        amr: null,
        acr: null,
      },
    };

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const { acrValues, acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);

    if (acrClaims) {
      claims['id_token']['acr'] = acrClaims;
    } else if (acrValues) {
      authorizeParams['acr_values'] = acrValues;
    }

    if (!idp.isEntraID) {
      authorizeParams.claims = claims;
    }

    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;

    // these specific behaviors are legacy implementations and should be homogenized in the future
    if (idpId === defaultIdpId && !idp.isEntraID) {
      authorizeParams['scope'] += ' is_service_public';
    }
    if (idpId !== defaultIdpId && !acrValues && !acrClaims) {
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
    };

    this.session.set('User', sessionPayload);

    this.logger.track(TrackedEvent.IDP_CHOSEN);

    res.redirect(authorizationUrl);
  }
}
