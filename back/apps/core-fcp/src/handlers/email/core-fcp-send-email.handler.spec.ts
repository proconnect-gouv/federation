import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { MailerService } from '@fc/mailer';
import { CoreFcpSendEmailHandler } from './core-fcp-send-email.handler';
import { CoreFcpNoEmailException } from '../../exceptions';

describe('CoreFcpSendEmailHandler', () => {
  let service: CoreFcpSendEmailHandler;

  const fromMock = { email: 'address@fqdn.ext', name: 'Address' };
  const configMailerMock = {
    from: fromMock,
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const uidMock = '42';

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const spIdentityWithEmailMock = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'Edward',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'TEACH',
    email: 'eteach@fqdn.ext',
  };

  const spIdentityWithoutEmailMock = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'Edward',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'TEACH',
    email: undefined,
  };

  const idpIdentityMock = {
    sub: 'some idpSub',
  };

  const reqMock = {
    fc: { interactionId: uidMock },
    ip: '123.123.123.123',
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const serviceProviderMock = {
    getById: jest.fn(),
  };

  const sessionDataMock = {
    idpId: '42',
    idpAcr: 'eidas3',
    idpName: 'my favorite Idp',
    idpIdentity: idpIdentityMock,

    spId: 'sp_id',
    spAcr: 'eidas3',
    spName: 'my great SP',
    spIdentity: spIdentityWithEmailMock,
  };

  const mailerServiceMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CoreFcpSendEmailHandler,
        LoggerService,
        SessionService,
        MailerService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .compile();

    service = module.get<CoreFcpSendEmailHandler>(CoreFcpSendEmailHandler);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
  });

  it('should be defined', () => {
    // Given
    const configName = 'Mailer';

    // Then
    expect(service).toBeDefined();
    expect(configServiceMock.get).toBeCalledTimes(1);
    expect(configServiceMock.get).toBeCalledWith(configName);
  });

  describe('handle', () => {
    const spMock = {
      key: '123456',
      entityId: 'AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHH',
    };
    beforeEach(() => {
      serviceProviderMock.getById.mockResolvedValue(spMock);

      configServiceMock.get.mockReturnValue(configMailerMock);
      service['configMailer'] = configMailerMock;
    });

    it('should not throw if email is sent', async () => {
      // Then
      await expect(service.handle(reqMock)).resolves.not.toThrow();
    });

    it('should call SessionService.get with interactionId', async () => {
      // When
      await service.handle(reqMock);

      // Then
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith(reqMock.fc.interactionId);
    });

    it('should send the email to the end-user by calling "mailer.send"', async () => {
      // Given
      const expectedEmailParams = {
        body: `Connexion établie via ${sessionDataMock.idpName} !`,
        from: fromMock,
        subject: `Connexion depuis FranceConnect sur ${sessionDataMock.spName}`,
        to: [
          {
            email: spIdentityWithEmailMock.email,
            name: `${spIdentityWithEmailMock.given_name} ${spIdentityWithEmailMock.family_name}`,
          },
        ],
      };

      // When
      await service.handle(reqMock);

      // Then
      expect(mailerServiceMock.send).toBeCalledTimes(1);
      expect(mailerServiceMock.send).toBeCalledWith(expectedEmailParams);
    });

    // Dependencies sevices errors
    it('should throw an `Error` if the FROM email is no valid', async () => {
      // Given
      configServiceMock.get.mockReturnValue({
        from: 'fake_email',
      });
      const errorMock = new Error('my error');
      sessionServiceMock.get.mockRejectedValueOnce(errorMock);
      // When/Then
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });

    it('should throw an Error if the TO email is no valid', async () => {
      // Given
      const sessionDataWithoutEmailMock = {
        idpId: '42',
        idpAcr: 'eidas3',
        idpName: 'my favorite Idp',
        idpIdentity: idpIdentityMock,

        spId: 'sp_id',
        spAcr: 'eidas3',
        spName: 'my great SP',
        spIdentity: spIdentityWithoutEmailMock,
      };
      sessionServiceMock.get.mockResolvedValue(sessionDataWithoutEmailMock);

      // When/Then
      const errorMock = new CoreFcpNoEmailException('No email defined');
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });
  });
});
