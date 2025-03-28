import { isEmpty } from 'lodash';
import { v4 as uuid } from 'uuid';

import { Inject, Injectable } from '@nestjs/common';

import { AppConfig } from '@fc/app';
import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import {
  CORE_SERVICE,
  CoreIdpHintException,
  CoreOidcProviderMiddlewareService,
  CoreRoutes,
} from '@fc/core';
import { FlowStepsService } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { stringToArray } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientRoutes } from '@fc/oidc-client';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  OidcCtx,
  OidcProviderErrorService,
  OidcProviderMiddlewareStep,
  OidcProviderPrompt,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { Session, SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { GetAuthorizeCoreSessionDto, GetAuthorizeSessionDto } from '../dto';
import { CoreFcaService } from './core-fca.service';

@Injectable()
export class CoreFcaMiddlewareService extends CoreOidcProviderMiddlewareService {
  // Dependency injection can require more than 4 parameters
  // eslint-disable-next-line max-params
  constructor(
    protected readonly logger: LoggerService,
    protected readonly config: ConfigService,
    protected readonly oidcProvider: OidcProviderService,
    protected readonly sessionService: SessionService,
    protected readonly serviceProvider: ServiceProviderAdapterMongoService,
    protected readonly tracking: TrackingService,
    protected readonly oidcErrorService: OidcProviderErrorService,
    protected readonly oidcAcr: OidcAcrService,
    @Inject(CORE_SERVICE)
    protected readonly core: CoreFcaService,
    protected readonly flowSteps: FlowStepsService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    protected readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {
    super(
      logger,
      config,
      oidcProvider,
      sessionService,
      serviceProvider,
      tracking,
      oidcErrorService,
      oidcAcr,
      core,
      flowSteps,
      identityProvider,
    );
  }

  onModuleInit() {
    this.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaErrorCatcherMiddlewareFactory(this.beforeAuthorizeMiddleware),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.BEFORE,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaErrorCatcherMiddlewareFactory(
        this.handleSilentAuthenticationMiddleware,
      ),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaErrorCatcherMiddlewareFactory(this.afterAuthorizeMiddleware),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.AUTHORIZATION,
      this.koaErrorCatcherMiddlewareFactory(this.overrideClaimAmrMiddleware),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.TOKEN,
      this.koaErrorCatcherMiddlewareFactory(this.tokenMiddleware),
    );

    this.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.USERINFO,
      this.koaErrorCatcherMiddlewareFactory(this.userinfoMiddleware),
    );
  }

  protected async handleSilentAuthenticationMiddleware(
    ctx: OidcCtx,
  ): Promise<void> {
    const { prompt } = this.getAuthorizationParameters(ctx);

    if (!prompt) {
      return this.overrideAuthorizePrompt(ctx);
    }

    const isSilentAuthentication = this.isPromptStrictlyEqualNone(prompt);

    // Persist this flag to adjust redirections during '/verify'
    this.sessionService.set(
      'OidcClient',
      'isSilentAuthentication',
      isSilentAuthentication,
    );
    await this.sessionService.commit();

    const isUserConnectedAlready = !isEmpty(
      this.sessionService.get<Session>('OidcClient')?.spIdentity,
    );

    if (isUserConnectedAlready && isSilentAuthentication) {
      // Given the Panva middlewares lack of active session awareness, overriding the prompt value is crucial to prevent
      // login-required errors. Silent authentication will be treated as a login attempt when an active session exists.
      this.overrideAuthorizePrompt(ctx);
    }
  }

  private isPromptStrictlyEqualNone(prompt: string) {
    if (!prompt) {
      return false;
    }
    const promptValues = stringToArray(prompt);
    return (
      promptValues.length === 1 && promptValues[0] === OidcProviderPrompt.NONE
    );
  }

  // eslint-disable-next-line complexity
  async afterAuthorizeMiddleware(ctx: OidcCtx) {
    const eventContext = this.getEventContext(ctx);
    const { interactionId } = eventContext.fc;

    await this.renewSession(ctx);

    const {
      acr_values: spAcr,
      client_id: spId,
      redirect_uri: spRedirectUri,
      state,
      idp_hint: idpHint,
    } = ctx.oidc.params as { [k: string]: string };

    const hintedIdp = await this.identityProvider.getById(idpHint);
    if (idpHint && isEmpty(hintedIdp)) {
      throw new CoreIdpHintException();
    }

    const session = this.sessionService.get<Session>('OidcClient');

    const hasIdentityInSession = !isEmpty(session?.spIdentity);
    const idpHintIsValidForCurrentSession =
      !idpHint || session?.idpId === hintedIdp.uid;

    const isUserConnectedAlready =
      hasIdentityInSession && idpHintIsValidForCurrentSession;

    /**
     * We  have to cast properties of `ctx.oidc.params` to `string`
     * since `oidc-provider`defines them as `unknown`
     */
    const { name: spName } = await this.serviceProvider.getById(spId);

    this.sessionService.set('OidcClient', {
      interactionId,
      spAcr: spAcr as string | undefined,
      spId: spId as string,
      spRedirectUri: spRedirectUri as string,
      spName,
      spState: state,
      reusesActiveSession: isUserConnectedAlready,
      /**
       * Explicit stepRoute set
       *
       * we can not rely on @SetStep() decorator
       * since we reset the session.
       */
      stepRoute: OidcProviderRoutes.AUTHORIZATION,
      browsingSessionId:
        this.sessionService.get('OidcClient', 'browsingSessionId') || uuid(),
    });

    await this.sessionService.commit();

    const { FC_AUTHORIZE_INITIATED } = this.tracking.TrackedEventsMap;
    await this.tracking.track(FC_AUTHORIZE_INITIATED, eventContext);

    if (isUserConnectedAlready) {
      this.logger.info('User already connected, skipping IdP authentication.');
      const { FC_SSO_INITIATED } = this.tracking.TrackedEventsMap;
      await this.tracking.track(FC_SSO_INITIATED, eventContext);

      const interactionId = this.oidcProvider.getInteractionIdFromCtx(ctx);
      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${CoreRoutes.INTERACTION_VERIFY.replace(
        ':uid',
        interactionId,
      )}`;

      return ctx.res.redirect(url);
    } else if (idpHint) {
      this.flowSteps.setStep(OidcClientRoutes.REDIRECT_TO_IDP);
      await this.core.redirectToIdp(ctx.res, idpHint, { acr_values: spAcr });
      await this.sessionService.commit();
      const { FC_REDIRECTED_TO_HINTED_IDP } = this.tracking.TrackedEventsMap;
      return this.tracking.track(FC_REDIRECTED_TO_HINTED_IDP, eventContext);
    }
  }

  private async isSessionValid() {
    const data = this.sessionService.get<Session>('OidcClient');

    if (!data) {
      return false;
    }

    const validationErrors = await validateDto(data, GetAuthorizeSessionDto, {
      forbidNonWhitelisted: true,
    });

    this.logger.debug({ data, validationErrors });

    return validationErrors.length === 0;
  }

  private async renewSession(ctx: OidcCtx): Promise<void> {
    const { res } = ctx;
    const isSessionValid = await this.isSessionValid();

    if (isSessionValid) {
      // The session is duplicated here to mitigate cookie-theft-based attacks.
      // For more information, refer to: https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1288
      await this.sessionService.duplicate(res, GetAuthorizeCoreSessionDto);
      this.logger.debug('Session has been detached and duplicated');
    } else {
      await this.sessionService.reset(res);
      this.logger.debug('Session has been reset');
    }
  }
}
