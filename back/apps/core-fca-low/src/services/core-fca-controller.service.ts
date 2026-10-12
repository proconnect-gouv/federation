import { Request, Response } from "express";

import { Injectable } from "@nestjs/common";

import { ConfigService } from "#libs/config";
import { EmailValidatorService } from "#libs/email-validator/services/index";
import { LoggerService, TrackedEvent } from "#libs/logger";
import { OidcAcrService } from "#libs/oidc-acr";
import { OidcClientService } from "#libs/oidc-client";
import { OidcProviderService } from "#libs/oidc-provider";
import { SessionService } from "#libs/session";
import {
  AfterGetInteractionSessionDto,
  AfterRedirectToIdpWithEmailSessionDto,
  AppConfig,
  UserSession,
} from "#src/dto/index";
import { Routes } from "#src/enums/index";
import { NoIdpException } from "#src/exceptions/index";
import { CoreFcaService } from "#src/services/core-fca.service";

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
    this.session.set("User", { rememberMe: rememberMe, idpLoginHint: email });

    const { isEmailValid, suggestion } =
      await this.emailValidatorService.validate(email);

    if (!isEmailValid) {
      const { uid: interactionId } = await this.oidcProvider.getInteraction(
        req,
        res,
      );
      const { urlPrefix } = this.config.get<AppConfig>("App");
      let url = `${urlPrefix}${Routes.INTERACTION.replace(
        ":uid",
        interactionId,
      )}?error=invalid_email&user_email=${encodeURIComponent(email)}`;

      if (!!suggestion) {
        url += `&email_suggestion=${encodeURIComponent(suggestion)}`;
      }
      this.logger.warn({
        code: "email_not_safe_to_send",
        emailSuggestion: suggestion,
        emailSuggestionDomain: suggestion?.split("@").pop().toLowerCase(),
      });
      return res.redirect(url);
    }

    const idpsFromEmail = await this.coreFcaService.selectIdpsFromEmail(email);

    if (idpsFromEmail.length === 0) {
      const { spName } =
        this.session.get<AfterGetInteractionSessionDto>("User");

      throw new NoIdpException(spName, email);
    }

    if (idpsFromEmail.length > 1) {
      const { urlPrefix } = this.config.get<AppConfig>("App");
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
      this.session.get<AfterRedirectToIdpWithEmailSessionDto>("User");

    this.coreFcaService.ensureEmailIsAuthorizedForSp(spId, idpLoginHint);

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const filteredAcrParams = this.oidcAcr.getFilteredAcrParamsFromInteraction(
      interaction,
      idpId,
    );

    const customAuthorizeParams = {
      login_hint: idpLoginHint,
      siret_hint: spSiretHint,
      sp_id: spId,
      sp_name: spName,
      remember_me: rememberMe,
    };

    const { authorizationUrl, nonce, state, idpName, idpLabel } =
      await this.oidcClient.getAuthorizationUrl(
        idpId,
        filteredAcrParams,
        customAuthorizeParams,
      );

    const sessionPayload: UserSession = {
      idpId,
      idpName,
      idpLabel,
      idpNonce: nonce,
      idpState: state,
      idpIdentity: undefined,
      spIdentity: undefined,
    };

    this.session.set("User", sessionPayload);

    const isBrowserIpOnRIE = this.coreFcaService.isIpOnRie(req.ip?.toString());
    const isIdpOnlyAccessibleThroughRIE =
      await this.coreFcaService.computeIsIdpOnlyAccessibleThroughRIE(idpId);

    if (!isBrowserIpOnRIE && isIdpOnlyAccessibleThroughRIE) {
      const { urlPrefix } = this.config.get<AppConfig>("App");
      const url = `${urlPrefix}${Routes.RIE_IDP_WARNING}`;

      this.session.set("User", {
        idpAuthorizationUrl: authorizationUrl,
      });

      return res.redirect(url);
    }

    this.logger.track(TrackedEvent.IDP_CHOSEN);

    res.redirect(authorizationUrl);
  }
}
