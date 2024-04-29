import { v4 as uuid } from 'uuid';

import { Test, TestingModule } from '@nestjs/testing';

import { AccountFca, AccountFcaService } from '@fc/account-fca';
import { CoreAcrService } from '@fc/core';
import { CoreFcaAgentAccountBlockedException } from '@fc/core-fca/exceptions';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { getLoggerMock } from '@mocks/logger';
import { getSessionServiceMock } from '@mocks/session';

import { CoreFcaDefaultVerifyHandler } from './core-fca.default-verify.handler';

jest.mock('uuid');

describe('CoreFcaDefaultVerifyHandler', () => {
  let service: CoreFcaDefaultVerifyHandler;

  const uuidMock = jest.mocked(uuid);

  const loggerServiceMock = getLoggerMock();

  const accountIdMock = 'accountIdMock value';
  const universalSubMock = '0b3d4211-d85e-4839-b0ac-2c8a218fe4dd';

  const accountFcaMock = {
    id: accountIdMock,
    sub: universalSubMock,
    active: true,
  } as AccountFca;

  const coreAcrServiceMock = {
    checkIfAcrIsValid: jest.fn(),
  };

  const sessionServiceMock = getSessionServiceMock();

  const idpIdentityMock = {
    sub: 'computedSubIdp',
    // Oidc Naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'givenNameValue',
    uid: 'uidValue',
    // Oidc Naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    usual_name: 'usalNameValue',
    email: 'myemail@mail.fr',
  };

  const { sub: _sub, ...idpIdentityMockCleaned } = idpIdentityMock;

  const sessionDataMock = {
    idpId: '42',
    idpAcr: 'eidas3',
    idpName: 'my favorite Idp',
    idpIdentity: idpIdentityMock,
    spId: 'sp_id',
    spAcr: 'eidas3',
    spName: 'my great SP',
    spIdentity: idpIdentityMock,
    amr: ['pwd'],
  };

  const fcaIdentityMock = {
    ...idpIdentityMockCleaned,
    // AgentConnect claims naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    idp_id: sessionDataMock.idpId,
    // AgentConnect claims naming convention
    // eslint-disable-next-line @typescript-eslint/naming-convention
    idp_acr: sessionDataMock.idpAcr,
  };

  const handleArgument = {
    sessionOidc: sessionServiceMock,
  };

  const identityProviderAdapterMock = {
    getById: jest.fn(),
  };

  const idpAgentKeyMock = {
    idpSub: idpIdentityMock.sub,
    idpUid: idpIdentityMock.uid,
  };

  const accountFcaServiceMock = {
    saveInteraction: jest.fn(),
    getAccountByIdpAgentKeys: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcaDefaultVerifyHandler,
        SessionService,
        LoggerService,
        CoreAcrService,
        IdentityProviderAdapterMongoService,
        AccountFcaService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(CoreAcrService)
      .useValue(coreAcrServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMock)
      .overrideProvider(AccountFcaService)
      .useValue(accountFcaServiceMock)
      .compile();

    service = module.get<CoreFcaDefaultVerifyHandler>(
      CoreFcaDefaultVerifyHandler,
    );

    jest.resetAllMocks();
    jest.restoreAllMocks();

    sessionServiceMock.get.mockReturnValue(sessionDataMock);

    identityProviderAdapterMock.getById.mockResolvedValue({
      maxAuthorizedAcr: 'maxAuthorizedAcr value',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle()', () => {
    beforeEach(() => {
      const newSub = 'newSub';
      uuidMock.mockReturnValueOnce(newSub);

      const persistLongTermIdentitySpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'persistLongTermIdentity');

      persistLongTermIdentitySpied.mockReturnValueOnce(accountFcaMock);
    });

    it('should not throw if verified', async () => {
      // Then
      await expect(service.handle(handleArgument)).resolves.not.toThrow();
    });

    it('should throw if acr is not validated', async () => {
      // Given
      const errorMock = new Error('my error 1');
      coreAcrServiceMock.checkIfAcrIsValid.mockImplementation(() => {
        throw errorMock;
      });
      // Then
      await expect(service.handle(handleArgument)).rejects.toThrow(errorMock);
    });

    it('sould call persistLongTermIdentity with agent identity and idp id', async () => {
      // When

      const composeFcaIdentitySpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'persistLongTermIdentity');

      await service.handle(handleArgument);

      // Then
      expect(composeFcaIdentitySpied).toHaveBeenCalledTimes(1);
      expect(composeFcaIdentitySpied).toHaveBeenCalledWith(
        idpIdentityMock,
        sessionDataMock.idpId,
      );
    });

    it('should throw if account is blocked', async () => {
      // Given
      const checkIfAccountIsBlockedSpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'checkIfAccountIsBlocked');

      const errorMock = new CoreFcaAgentAccountBlockedException();
      checkIfAccountIsBlockedSpied.mockImplementation(() => {
        throw errorMock;
      });

      // Then
      await expect(service.handle(handleArgument)).rejects.toThrow(errorMock);
    });

    it('should throw if identity provider is not usable', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.get.mockImplementationOnce(() => {
        throw errorMock;
      });
      // Then
      await expect(service.handle(handleArgument)).rejects.toThrow(errorMock);
    });

    it('should call composeFcaIdentitySpied with idp identity, idp id and idp acr', async () => {
      // When
      const composeFcaIdentitySpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'composeFcaIdentity');

      await service.handle(handleArgument);

      // Then
      expect(composeFcaIdentitySpied).toHaveBeenCalledTimes(1);
      expect(composeFcaIdentitySpied).toHaveBeenCalledWith(
        idpIdentityMock,
        sessionDataMock.idpId,
        sessionDataMock.idpAcr,
      );
    });

    it('should throw an error if composeFcaIdentity failed', async () => {
      // Given
      const composeFcaIdentitySpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'composeFcaIdentity');

      const errorMock = new Error('my error');
      composeFcaIdentitySpied.mockImplementation(() => {
        throw errorMock;
      });

      // Then
      await expect(service.handle(handleArgument)).rejects.toThrow(errorMock);
    });

    it('should patch the session with idp and sp identity', async () => {
      // Given
      const calledMock = {
        idpIdentity: idpIdentityMock,
        spIdentity: {
          // Oidc naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          given_name: idpIdentityMock.given_name,
          uid: idpIdentityMock.uid,
          // AgentConnect claims naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          idp_id: sessionDataMock.idpId,
          // AgentConnect claims naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          idp_acr: sessionDataMock.idpAcr,
          email: idpIdentityMock.email,
          // Oidc Naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          usual_name: idpIdentityMock.usual_name,
        },
        subs: {
          // AgentConnect claims naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          sp_id: universalSubMock,
        },
        accountId: accountIdMock,
        amr: ['pwd'],
      };

      // When
      await service.handle(handleArgument);

      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith(calledMock);
    });

    it('should throw if identity storage for service provider fails', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.set.mockImplementationOnce(() => {
        throw errorMock;
      });

      // Then
      await expect(service.handle(handleArgument)).rejects.toThrow(errorMock);
    });
  });

  describe('persistLongTermIdentity()', () => {
    it('should call create a new uuid and ipd uuid when account is not found', async () => {
      const newSub = 'newSub';
      uuidMock.mockReturnValueOnce(newSub);

      const saveInteractionToDatabaseSpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'saveInteractionToDatabase');

      accountFcaServiceMock.getAccountByIdpAgentKeys.mockReturnValueOnce(null);

      await service['persistLongTermIdentity'](
        idpIdentityMock,
        idpAgentKeyMock.idpUid,
      );

      expect(saveInteractionToDatabaseSpied).toHaveBeenCalledTimes(1);
      expect(saveInteractionToDatabaseSpied).toHaveBeenCalledWith(
        newSub,
        idpAgentKeyMock,
        null,
      );
    });

    it('should use existing uuid and idp uuid when account is found', async () => {
      const saveInteractionToDatabaseSpied = jest.spyOn<
        CoreFcaDefaultVerifyHandler,
        any
      >(service, 'saveInteractionToDatabase');

      accountFcaServiceMock.getAccountByIdpAgentKeys.mockResolvedValueOnce(
        accountFcaMock,
      );

      await service['persistLongTermIdentity'](
        idpIdentityMock,
        idpAgentKeyMock.idpUid,
      );

      idpAgentKeyMock.idpUid = accountFcaMock.id;

      expect(saveInteractionToDatabaseSpied).toHaveBeenCalledTimes(1);
      expect(saveInteractionToDatabaseSpied).toHaveBeenCalledWith(
        accountFcaMock.sub,
        {
          idpSub: idpIdentityMock.sub,
          idpUid: idpIdentityMock.uid,
        },
        accountFcaMock,
      );
    });
  });

  describe('getIdpAgentKey()', () => {
    it('should return a concatenation of idpUid and idpSub', () => {
      const result = service['getIdpAgentKey'](
        sessionDataMock.idpId,
        idpIdentityMock.sub,
      );

      expect(result).toStrictEqual({
        idpUid: sessionDataMock.idpId,
        idpSub: idpIdentityMock.sub,
      });
    });
  });

  describe('saveInteractionToDatabase()', () => {
    it('should call saveInteraction() with correct params', async () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2020, 1, 2));

      await service['saveInteractionToDatabase'](
        universalSubMock,
        idpAgentKeyMock,
      );

      expect(accountFcaServiceMock.saveInteraction).toHaveBeenCalledTimes(1);
      expect(accountFcaServiceMock.saveInteraction).toHaveBeenCalledWith(
        {
          idpUid: idpAgentKeyMock.idpUid,
          idpSub: idpAgentKeyMock.idpSub,
          lastConnection: new Date(2020, 1, 2),
          sub: universalSubMock,
        },
        undefined,
      );

      jest.useRealTimers();
    });
  });

  describe('composeFcaIdentity()', () => {
    it('should return a clean identity', () => {
      const result = service['composeFcaIdentity'](
        idpIdentityMock,
        sessionDataMock.idpId,
        sessionDataMock.idpAcr,
      );

      const expected = {
        ...idpIdentityMockCleaned,
        // AgentConnect claims naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        idp_id: '42',
        // AgentConnect claims naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        idp_acr: 'eidas3',
      };

      expect(result).toStrictEqual(expected);
    });
  });

  describe('storeIdentityWithSessionService()', () => {
    it('should set the Oidc session', () => {
      service['storeIdentityWithSessionService'](
        sessionServiceMock,
        accountFcaMock.sub,
        idpIdentityMock,
        accountIdMock,
      );

      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
    });

    it('should call session set with amr parameters', () => {
      // When
      service['storeIdentityWithSessionService'](
        sessionServiceMock,
        accountFcaMock.sub,
        fcaIdentityMock,
        accountIdMock,
      );

      // Then
      expect(sessionServiceMock.set).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.set).toHaveBeenCalledWith({
        accountId: accountIdMock,
        amr: ['pwd'],
        idpIdentity: idpIdentityMock,
        spIdentity: {
          ...idpIdentityMockCleaned,
          // AgentConnect claims naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          idp_id: sessionDataMock.idpId,
          // AgentConnect claims naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          idp_acr: sessionDataMock.idpAcr,
        },
        subs: {
          // AgentConnect claims naming convention
          // eslint-disable-next-line @typescript-eslint/naming-convention
          sp_id: universalSubMock,
        },
      });
    });
  });

  describe('checkIfAccountIsBlocked()', () => {
    it('should throw an error if account is not active', () => {
      accountFcaMock.active = false;

      expect(() => service['checkIfAccountIsBlocked'](accountFcaMock)).toThrow(
        new CoreFcaAgentAccountBlockedException(),
      );
    });

    it('should not throw an error if account is active', () => {
      accountFcaMock.active = true;

      expect(() =>
        service['checkIfAccountIsBlocked'](accountFcaMock),
      ).not.toThrow();
    });
  });
});
