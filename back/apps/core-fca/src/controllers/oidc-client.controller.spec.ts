import { cloneDeep } from 'lodash';

import { Test, TestingModule } from '@nestjs/testing';

import * as FcCommon from '@fc/common';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { CsrfTokenGuard } from '@fc/csrf';
import { EmailValidatorService } from '@fc/email-validator/services';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata, IOidcIdentity } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import {
  OidcClientConfigService,
  OidcClientService,
  TokenParams,
} from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { Session, SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { AppConfig, GetOidcCallbackCoreSessionDto } from '../dto';
import { CoreFcaAgentNoIdpException } from '../exceptions';
import {
  CoreFcaFqdnService,
  CoreFcaService,
  IdentitySanitizer,
} from '../services';
import { OidcClientController } from './oidc-client.controller';

jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  cloneDeep: jest.fn(),
}));

jest.mock('querystring', () => ({
  encode: jest.fn(),
}));

jest.mock('@fc/common', () => {
  return {
    ...jest.requireActual('@fc/common'),
    validateDto: jest.fn(),
  };
});

describe('OidcClient Controller', () => {
  let controller: OidcClientController;
  let res;
  let req;

  const oidcClientServiceMock = {
    utils: {
      getAuthorizeUrl: jest.fn(),
      wellKnownKeys: jest.fn(),
      buildAuthorizeParameters: jest.fn(),
      checkIdpDisabled: jest.fn(),
    },
    getEndSessionUrlFromProvider: jest.fn(),
    getTokenFromProvider: jest.fn(),
    getUserInfosFromProvider: jest.fn(),
  };

  const loggerServiceMock = getLoggerMock();

  const spIdMock = 'spIdMock';
  const idpIdMock = 'idpIdMock';
  const stateMock = 'stateMock';
  const nonceMock = 'nonceMock';
  const idpIdTokenMock = 'idpIdTokenMock';
  const oidcProviderLogoutFormMock =
    '<form id="idLogout" method="post" action="https://endsession"><input type="hidden" name="xsrf" value="1233456azerty"/></form>';

  const params = { uid: 'abcdefghijklmnopqrstuvwxyz0123456789' };
  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'acrMockValue';
  const spNameMock = 'some SP';

  const sessionServiceMock = getSessionServiceMock();

  const identityProviderServiceMock = {
    getById: jest.fn(),
    isActiveById: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
    TrackedEventsMap: {
      FC_REQUESTED_IDP_USERINFO: Symbol('FC_REQUESTED_IDP_USERINFO'),
    },
  };

  const configMock = {
    configuration: { acrValues: ['acr'] },
    defaultRedirectUri: 'https://hogwartsconnect.gouv.fr',
    scope: 'some scope',
    urlPrefix: '/api/v2',
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const interactionDetailsResolved = {
    params: {
      acr_values: 'acr',
      scope: 'toto titi',
    },
    prompt: Symbol('prompt'),
    uid: Symbol('uid'),
  };

  const oidcAcrServiceMock = {
    getFilteredAcrValues: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
  };

  const providerIdMock = 'providerIdMockValue';

  const identityMock = {
    given_name: 'given_name',
    sub: '1',
    email: 'complete@identity.fr',
    usual_name: 'usual_name',
    uid: 'uid',
  };

  const sessionDataMock: Session = {
    spId: spIdMock,
    idpId: idpIdMock,
    idpNonce: nonceMock,
    idpState: stateMock,
    interactionId: interactionIdMock,
    spAcr: acrMock,
    spIdentity: {} as IOidcIdentity,
    spName: spNameMock,
    idpIdToken: idpIdTokenMock,
    oidcProviderLogoutForm: oidcProviderLogoutFormMock,
  };

  const trackingServiceMock: TrackingService = {
    track: jest.fn(),
    TrackedEventsMap: {
      FC_FQDN_MISMATCH: Symbol('FC_FQDN_MISMATCH'),
      IDP_CALLEDBACK: {},
    },
  } as unknown as TrackingService;

  const coreServiceMock: Record<
    keyof InstanceType<typeof CoreFcaService>,
    jest.Mock
  > = {
    getIdentityProvidersByIds: jest.fn(),
    redirectToIdp: jest.fn(),
  };

  const oidcClientConfigServiceMock = {
    get: jest.fn(),
  };

  const cryptographyMock = {
    genRandomString: jest.fn(),
  };

  const emailValidatorServiceMock = {
    validate: jest.fn(),
  };

  const csrfTokenGuardMock = {
    canActivate: () => true,
  };

  const coreFcaFqdnServiceMock = {
    getFqdnFromEmail: jest.fn(),
    getFqdnConfigFromEmail: jest.fn(),
    isAllowedIdpForEmail: jest.fn(),
  };

  const identitySanitizerMock = {
    sanitize: jest.fn(),
  };

  const validateDtoMock = jest.mocked(FcCommon.validateDto);

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcClientController],
      providers: [
        OidcClientService,
        LoggerService,
        SessionService,
        TrackingService,
        ConfigService,
        IdentityProviderAdapterMongoService,
        OidcAcrService,
        OidcProviderService,
        TrackingService,
        CoreFcaService,
        OidcClientConfigService,
        CryptographyService,
        EmailValidatorService,
        CoreFcaFqdnService,
        IdentitySanitizer,
      ],
    })
      .overrideGuard(CsrfTokenGuard)
      .useValue(csrfTokenGuardMock)
      .overrideProvider(OidcClientService)
      .useValue(oidcClientServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(OidcAcrService)
      .useValue(oidcAcrServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreServiceMock)
      .overrideProvider(OidcClientConfigService)
      .useValue(oidcClientConfigServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(EmailValidatorService)
      .useValue(emailValidatorServiceMock)
      .overrideProvider(CoreFcaFqdnService)
      .useValue(coreFcaFqdnServiceMock)
      .overrideProvider(IdentitySanitizer)
      .useValue(identitySanitizerMock)
      .compile();

    controller = module.get<OidcClientController>(OidcClientController);

    req = {
      method: 'GET',
      statusCode: 200,
      params,
    };
    res = {
      redirect: jest.fn(),
      render: jest.fn(),
    };

    const idpMock: Partial<IdentityProviderMetadata> = {
      name: 'nameValue',
      title: 'titleValue',
    };

    identityProviderServiceMock.getById.mockReturnValue(idpMock);
    sessionServiceMock.get.mockReturnValue(sessionDataMock);

    oidcClientServiceMock.utils.buildAuthorizeParameters.mockReturnValue({
      state: stateMock,
      nonce: nonceMock,
      scope: 'scopeMock',
      providerUid: providerIdMock,
      acr_values: 'acrMock',
    });

    oidcAcrServiceMock.getFilteredAcrValues.mockReturnValue(
      interactionDetailsResolved.params.acr_values,
    );

    oidcProviderServiceMock.getInteraction.mockResolvedValue(
      interactionDetailsResolved,
    );

    configServiceMock.get.mockReturnValue(configMock);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getIdentityProviderSelection()', () => {
    it('should render identity providers interaction page with default idp entitled "Autre"', async () => {
      // Given
      const hogwartsProviders = [
        'ravenclaw_provider_id',
        'slytherin_provider_id',
      ];

      const hogwardsFqdnConfig = {
        fqdn: 'hogwarts.uk',
        identityProviders: hogwartsProviders,
        acceptsDefaultIdp: true,
      };
      sessionServiceMock.get.mockReturnValueOnce({
        ...sessionDataMock,
        login_hint: 'harry.potter@hogwarts.uk',
      });

      const defaultIdpId = 'gryffindor_provider_id';
      configServiceMock.get.mockReturnValueOnce({
        defaultIdpId: 'gryffindor_provider_id',
      } satisfies Partial<InstanceType<typeof AppConfig>>);

      coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValueOnce({
        acceptsDefaultIdp: hogwardsFqdnConfig.acceptsDefaultIdp,
        fqdn: hogwardsFqdnConfig.fqdn,
        identityProviders: [
          ...hogwardsFqdnConfig.identityProviders,
          defaultIdpId,
        ],
      });

      coreServiceMock.getIdentityProvidersByIds.mockResolvedValueOnce([
        { title: 'Ravenclaw', uid: 'ravenclaw_provider_id' },
        { title: 'Slytherin', uid: 'slytherin_provider_id' },
        { title: 'Gryffindor', uid: 'gryffindor_provider_id' },
      ]);

      // When
      await controller.getIdentityProviderSelection(
        'csrfMockValue',
        res,
        sessionServiceMock,
      );

      // Then
      expect(coreServiceMock.getIdentityProvidersByIds).toHaveBeenCalledTimes(
        1,
      );
      expect(coreServiceMock.getIdentityProvidersByIds).toHaveBeenCalledWith([
        ...hogwartsProviders,
        defaultIdpId,
      ]);

      expect(configServiceMock.get).toHaveBeenCalledTimes(1);

      expect(res.render).toHaveBeenCalledTimes(1);
      expect(res.render).toHaveBeenCalledWith('interaction-identity-provider', {
        csrfToken: 'csrfMockValue',
        acceptsDefaultIdp: true,
        email: 'harry.potter@hogwarts.uk',
        providers: [
          { title: 'Ravenclaw', uid: 'ravenclaw_provider_id' },
          { title: 'Slytherin', uid: 'slytherin_provider_id' },
          { title: 'Autre', uid: 'gryffindor_provider_id' },
        ],
      });
    });
  });

  describe('redirectToIdp()', () => {
    it('should redirect to a given identity provider', async () => {
      // Given
      const body = {
        identityProviderUid: providerIdMock,
        csrfToken: 'csrfMockValue',
        email: 'harry.potter@hogwarts.uk',
      };

      // When
      await controller.redirectToIdp(req, res, body, sessionServiceMock);

      // Then
      expect(coreServiceMock.redirectToIdp).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.redirectToIdp).toHaveBeenCalledWith(
        res,
        providerIdMock,
        {
          acr_values: interactionDetailsResolved.params.acr_values,
          login_hint: body.email,
        },
      );
    });

    it('should redirect to the unique identity provider', async () => {
      // Given
      const body = {
        csrfToken: 'csrfMockValue',
        email: 'harry.potter@hogwarts.uk',
      };

      coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValueOnce({
        fqdn: 'hogwarts.uk',
        identityProviders: [providerIdMock],
        acceptsDefaultIdp: true,
      });

      // When
      await controller.redirectToIdp(req, res, body, sessionServiceMock);

      // Then
      expect(coreServiceMock.redirectToIdp).toHaveBeenCalledTimes(1);
      expect(coreServiceMock.redirectToIdp).toHaveBeenCalledWith(
        res,
        providerIdMock,
        {
          acr_values: interactionDetailsResolved.params.acr_values,
          login_hint: body.email,
        },
      );
    });

    it('should redirect to identity provider selection page when no email was provided', async () => {
      // Given
      const body = {
        csrfToken: 'csrfMockValue',
        email: 'harry.potter@hogwarts.uk',
      };

      coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValueOnce({
        fqdn: 'hogwarts.uk',
        identityProviders: ['gryffindor_provider_id', 'slytherin_provider_id'],
        acceptsDefaultIdp: true,
      });

      // When
      await controller.redirectToIdp(req, res, body, sessionServiceMock);

      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        '/api/v2/interaction/identity/select',
      );
    });

    it('should throw an CoreFcaAgentNoIdpException error when no default idp is found', async () => {
      // Given
      const body = {
        csrfToken: 'csrfMockValue',
        email: 'harry.potter@hogwarts.uk',
      };

      coreFcaFqdnServiceMock.getFqdnConfigFromEmail.mockResolvedValueOnce({
        fqdn: 'hogwarts.uk',
        identityProviders: [],
        acceptsDefaultIdp: false,
      });

      // Then
      await expect(
        controller.redirectToIdp(req, res, body, sessionServiceMock),
      ).rejects.toThrow(CoreFcaAgentNoIdpException);
    });
  });

  describe('getWellKnownKeys()', () => {
    it('should call oidc-client-service for wellKnownKeys', async () => {
      // When
      await controller.getWellKnownKeys();
      // Then
      expect(oidcClientServiceMock.utils.wellKnownKeys).toHaveBeenCalledTimes(
        1,
      );
    });
  });

  describe('logoutFromIdp', () => {
    const endsessionurlMock =
      'https://endsessionurl?id_token_hint=ureadable0123string&post_logout_redirect_uri=https://redirect-me-amigo-logout-callback&state=second-unreadble_string';
    beforeEach(() => {
      oidcClientServiceMock.getEndSessionUrlFromProvider.mockReturnValueOnce(
        endsessionurlMock,
      );

      oidcClientConfigServiceMock.get.mockReturnValue({ stateLength: 32 });
      cryptographyMock.genRandomString.mockReturnValueOnce(stateMock);
    });

    it('should call oidc config', async () => {
      // When
      await controller.logoutFromIdp(res, sessionServiceMock);

      // Then
      expect(oidcClientConfigServiceMock.get).toHaveBeenCalledTimes(1);
    });

    it('should generate a random state of 32 characters', async () => {
      // Given
      const randSize = 32;

      // When
      await controller.logoutFromIdp(res, sessionServiceMock);

      // Then
      expect(cryptographyMock.genRandomString).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.genRandomString).toHaveBeenCalledWith(randSize);
    });

    it('should call sessionOidc getter', async () => {
      // When
      await controller.logoutFromIdp(res, sessionServiceMock);

      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
    });

    it('should call oidcClient getEndSessionUrlFromProvider', async () => {
      // When
      await controller.logoutFromIdp(res, sessionServiceMock);

      // Then
      expect(
        oidcClientServiceMock.getEndSessionUrlFromProvider,
      ).toHaveBeenCalledTimes(1);
      expect(
        oidcClientServiceMock.getEndSessionUrlFromProvider,
      ).toHaveBeenCalledWith(idpIdMock, stateMock, idpIdTokenMock);
    });

    it('should redirect the user to the endSessionUrl', async () => {
      // When
      await controller.logoutFromIdp(res, sessionServiceMock);

      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(endsessionurlMock);
    });
  });

  describe('redirectAfterIdpLogout', () => {
    it('should call oidc session getter', async () => {
      // When
      await controller.redirectAfterIdpLogout(req, res, sessionServiceMock);

      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
    });

    it('should call session destroy', async () => {
      // When
      await controller.redirectAfterIdpLogout(req, res, sessionServiceMock);

      // Then
      expect(sessionServiceMock.destroy).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.destroy).toHaveBeenCalledWith(res);
    });

    it('should return oidcProviderLogoutForm', async () => {
      // When
      const result = await controller.redirectAfterIdpLogout(
        req,
        res,
        sessionServiceMock,
      );

      // Then
      expect(result).toEqual({
        oidcProviderLogoutForm: oidcProviderLogoutFormMock,
      });
    });
  });

  describe('getOidcCallback()', () => {
    const accessTokenMock = Symbol('accesToken');
    const acrMock = Symbol('acr');
    const amrMock = Symbol('amr');

    const tokenParamsMock: TokenParams = {
      state: stateMock,
      nonce: nonceMock,
    };

    const userInfoParamsMock = {
      accessToken: accessTokenMock,
      idpId: idpIdMock,
    };

    const identityExchangeMock = {
      idpAccessToken: accessTokenMock,
      idpAcr: acrMock,
      idpIdentity: identityMock,
      amr: amrMock,
    };
    const redirectMock = `/api/v2/interaction/${interactionIdMock}/verify`;

    beforeEach(() => {
      res = {
        redirect: jest.fn(),
      };

      validateDtoMock.mockResolvedValue([]);

      oidcClientServiceMock.getTokenFromProvider.mockReturnValueOnce({
        accessToken: accessTokenMock,
        acr: acrMock,
        amr: amrMock,
      });

      oidcClientServiceMock.getUserInfosFromProvider.mockReturnValueOnce(
        identityMock,
      );

      identitySanitizerMock.sanitize.mockResolvedValue({
        given_name: 'given_name',
        sub: '1',
        email: 'complete@identity.fr',
        usual_name: 'usual_name',
        uid: 'uid',
      });
    });

    it('should duplicate current session', async () => {
      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);
      // Then
      expect(sessionServiceMock.duplicate).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.duplicate).toHaveBeenCalledWith(
        res,
        GetOidcCallbackCoreSessionDto,
      );
    });

    it('should call token with providerId', async () => {
      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcClientServiceMock.getTokenFromProvider).toHaveBeenCalledWith(
        idpIdMock,
        tokenParamsMock,
        req,
        { sp_id: spIdMock },
      );
    });

    it('should call userinfo with acesstoken, dto and context', async () => {
      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(
        oidcClientServiceMock.getUserInfosFromProvider,
      ).toHaveBeenCalledTimes(1);
      expect(
        oidcClientServiceMock.getUserInfosFromProvider,
      ).toHaveBeenCalledWith(userInfoParamsMock, req);
    });

    it('should call not the sanitizer if validation has succeed', async () => {
      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(identitySanitizerMock.sanitize).toHaveBeenCalledTimes(0);
    });

    it('should call the sanitizer if validation has failed', async () => {
      // Given
      const validateDtoMock = jest.mocked(FcCommon.validateDto);
      const errorsMock = [
        {
          property: 'email',
          constraints: { isEmail: 'email must be an email' },
        },
      ];
      validateDtoMock.mockResolvedValue(errorsMock);

      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(identitySanitizerMock.sanitize).toHaveBeenCalledTimes(1);
      expect(identitySanitizerMock.sanitize).toHaveBeenCalledWith(
        identityMock,
        idpIdMock,
        errorsMock,
      );
    });

    it('should track fqdn missmatch if detected', async () => {
      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(trackingServiceMock.track).toHaveBeenCalledTimes(4);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        trackingServiceMock.TrackedEventsMap.FC_FQDN_MISMATCH,
        { req },
      );
    });

    it('should create an object with cloned values', async () => {
      // Given
      const cloneDeepMock = jest.mocked(cloneDeep);

      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(cloneDeepMock).toHaveBeenCalledTimes(1);
      expect(cloneDeepMock).toHaveBeenLastCalledWith(identityExchangeMock);
    });

    it('should set session with identity result.', async () => {
      // Given
      const clonedIdentityMock = Symbol();
      jest.mocked(cloneDeep).mockReturnValueOnce(clonedIdentityMock);

      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // assert
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(clonedIdentityMock);
    });

    it('should track empty email.', async () => {
      // Given
      oidcClientServiceMock.getUserInfosFromProvider
        .mockReset()
        .mockReturnValueOnce({});

      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // assert
      expect(trackingServiceMock.track).toHaveBeenCalledTimes(4);
      expect(trackingServiceMock.track).toHaveBeenCalledWith(
        trackingServiceMock.TrackedEventsMap.FC_REQUESTED_IDP_USERINFO,
        { req, fqdn: undefined },
      );
    });

    it('should redirect user after token and userinfo received and saved', async () => {
      // When
      await controller.getOidcCallback(req, res, sessionServiceMock);

      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(redirectMock);
    });
  });
});
