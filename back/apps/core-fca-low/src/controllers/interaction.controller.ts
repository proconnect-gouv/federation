import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { isEmpty } from 'lodash';

import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AccountFcaService } from '@fc/account-fca';
import { ConfigService } from '@fc/config';
import { CsrfService } from '@fc/csrf';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService, TrackedEvent } from '@fc/logger';
import { NotificationsService } from '@fc/notifications';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService, SessionService } from '@fc/session';

import { UserSessionDecorator } from '../decorators';
import {
  ActiveUserSessionDto,
  AfterGetOidcCallbackSessionDto,
  AppConfig,
  Interaction,
  InteractionParamsDto,
  UserSession,
} from '../dto';
import { Routes } from '../enums';
import {
  CoreFcaAgentAccountBlockedException,
  CoreFcaAgentNotFromPublicServiceException,
} from '../exceptions';
import { CoreFcaControllerService, CoreFcaService } from '../services';

@Controller()
export class InteractionController {
  constructor(
    private readonly accountService: AccountFcaService,
    private readonly coreFcaService: CoreFcaService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcAcr: OidcAcrService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly config: ConfigService,
    private readonly notifications: NotificationsService,
    private readonly sessionService: SessionService,
    private readonly coreFcaControllerService: CoreFcaControllerService,
    private readonly csrfService: CsrfService,
    private readonly logger: LoggerService,
  ) {}

  @Get(Routes.DEFAULT)
  @Header('cache-control', 'no-store')
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<AppConfig>('App');
    res.redirect(301, defaultRedirectUri);
  }

  @Get(Routes.INTERACTION)
  @Header('cache-control', 'no-store')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getInteraction(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: InteractionParamsDto,
    @Param() _params: Interaction,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ): Promise<void> {
    const interaction = await this.oidcProvider.getInteraction(req, res);

    const {
      uid: interactionId,
      params: {
        client_id: spId,
        state: spState,
        idp_hint: idpHint,
        login_hint: spLoginHint,
        siret_hint: spSiretHint,
      },
    } = interaction;

    const activeUserSession = plainToInstance(
      ActiveUserSessionDto,
      userSession.get(),
    );
    const activeSessionValidationErrors = await validate(activeUserSession);
    const isUserConnectedAlready = isEmpty(activeSessionValidationErrors);

    const isSessionOpenedWithHintedLogin =
      !spLoginHint || userSession.get('idpIdentity')?.email === spLoginHint;

    const hintedIdp = await this.identityProvider.getById(idpHint);
    if (idpHint && isEmpty(hintedIdp)) {
      return await this.oidcProvider.abortInteraction(req, res, {
        error: 'idp_hint_not_found',
        error_description: 'provided idp_hint could not be found',
      });
    }
    const isSessionOpenedWithHintedIdp =
      !idpHint || userSession.get('idpId') === hintedIdp.uid;

    const isEssentialAcrSatisfied =
      this.oidcAcr.isEssentialAcrSatisfied(interaction);

    const canReuseActiveSession =
      isUserConnectedAlready &&
      isSessionOpenedWithHintedIdp &&
      isEssentialAcrSatisfied &&
      isSessionOpenedWithHintedLogin;

    const { name: spName } = await this.serviceProvider.getById(spId);
    const { acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);
    const spEssentialAcr =
      acrClaims?.value || acrClaims?.values.join(' ') || null;

    if (!canReuseActiveSession) {
      userSession.clear();
    }
    userSession.set({
      spLoginHint,
      spSiretHint,
      interactionId,
      spEssentialAcr,
      spId,
      spName,
      spState,
      reusesActiveSession: canReuseActiveSession,
    });
    await userSession.commit();

    this.logger.track(TrackedEvent.FC_AUTHORIZE_INITIATED);

    if (canReuseActiveSession) {
      this.logger.track(TrackedEvent.FC_SSO_INITIATED);

      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${Routes.INTERACTION_VERIFY.replace(
        ':uid',
        interactionId,
      )}`;

      return res.redirect(url);
    }

    if (idpHint) {
      this.logger.track(TrackedEvent.FC_REDIRECTED_TO_HINTED_IDP);

      return this.coreFcaControllerService.redirectToIdpWithIdpId(
        req,
        res,
        idpHint,
      );
    }

    const isEmailInvalid = query.error === 'invalid_email';

    if (spLoginHint && !isEmailInvalid) {
      this.logger.track(TrackedEvent.FC_REDIRECTED_TO_HINTED_LOGIN);

      return this.coreFcaControllerService.redirectToIdpWithEmail(
        req,
        res,
        spLoginHint,
        false,
      );
    }

    this.logger.track(TrackedEvent.FC_SHOWED_IDP_CHOICE);

    const notification = await this.notifications.getNotificationToDisplay();
    const { defaultEmailRenater } = this.config.get<AppConfig>('App');

    const csrfToken = this.csrfService.renew();
    this.sessionService.set('Csrf', { csrfToken });

    res.render('interaction', {
      csrfToken,
      defaultEmailRenater,
      notificationMessage: notification?.message,
      spName,
      isEmailInvalid,
      emailSuggestion: query.email_suggestion,
      loginHint: query.user_email,
    });
  }

  @Get(Routes.INTERACTION_VERIFY)
  @Header('cache-control', 'no-store')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(
    @Req() req: Request,
    @Res() res: Response,
    @Param() _params: Interaction,
    @UserSessionDecorator(AfterGetOidcCallbackSessionDto)
    userSessionService: ISessionService<AfterGetOidcCallbackSessionDto>,
  ) {
    const {
      spIdentity: { sub },
      amr,
      idpAcr,
      idpId,
      idpIdentity,
      spIdentity: { email },
      interactionId,
      isSilentAuthentication,
      spEssentialAcr,
      spId,
    } = userSessionService.get();

    const account = await this.accountService.getAccountBySub(sub);
    if (!account || !account.active) {
      throw new CoreFcaAgentAccountBlockedException();
    }

    this.coreFcaService.ensureEmailIsAuthorizedForSp(spId, email);

    const isIdpActive = await this.identityProvider.isActiveById(idpId);
    if (!isIdpActive) {
      if (isSilentAuthentication) {
        return await this.oidcProvider.abortInteraction(req, res, {
          error: 'login_required',
          error_description: 'end-user authentication is required',
        });
      }

      const { urlPrefix } = this.config.get<AppConfig>('App');

      this.logger.track(TrackedEvent.FC_IDP_DISABLED);

      const url = `${urlPrefix}${Routes.INTERACTION.replace(
        ':uid',
        interactionId,
      )}`;
      return res.redirect(url);
    }

    const { type: spType } = await this.serviceProvider.getById(spId);
    // is_service_public field is only provided by ProConnect Identité
    // any identity without an is_service_public field is considered to be from the public sector
    const isPrivateSectorIdentity = idpIdentity?.is_service_public === false;
    const doesNotAcceptPrivateSectorEmployees = spType === 'public';

    if (isPrivateSectorIdentity && doesNotAcceptPrivateSectorEmployees) {
      throw new CoreFcaAgentNotFromPublicServiceException();
    }

    const interactionAcr = this.oidcAcr.getInteractionAcr({
      idpAcr,
      spEssentialAcr,
    });

    if (!interactionAcr) {
      return await this.oidcProvider.abortInteraction(req, res, {
        error: 'access_denied',
        error_description: 'requested ACRs could not be satisfied',
      });
    }

    const session: UserSession = {
      interactionAcr,
    };
    userSessionService.set(session);

    this.logger.track(TrackedEvent.FC_VERIFIED);

    return this.oidcProvider.finishInteraction(req, res, {
      amr,
      acr: interactionAcr,
    });
  }
}
