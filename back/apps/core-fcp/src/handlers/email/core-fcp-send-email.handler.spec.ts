import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import {
  MailerNotificationConnectException,
  NoEmailException,
  MailerService,
} from '@fc/mailer';
import { CoreFcpSendEmailHandler } from './core-fcp-send-email.handler';

function generateMD5SumFromHTMLContent(content: string) {
  const md5 = crypto.createHash('md5').update(content).digest('hex');
  return md5;
}

function loadConnectNotificationEmailTemplateMock() {
  const connectNotificationEmailTemplatePath = path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'instances',
    'core-fcp-high',
    'src',
    'views',
    'connect-notification-email.tpl.ejs',
  );
  const connectNotificiationEmailTemplate = fs.readFileSync(
    connectNotificationEmailTemplatePath,
    'utf8',
  );
  return connectNotificiationEmailTemplate;
}

describe('CoreFcpSendEmailHandler', () => {
  let service: CoreFcpSendEmailHandler;

  const fromMock = { email: 'address@fqdn.ext', name: 'Address' };
  const configMailerMock = {
    from: fromMock,
    template: loadConnectNotificationEmailTemplateMock(),
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

  const spMock = {
    key: '123456',
    entityId: 'AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHH',
  };

  const connectNotificationEmailParametersMock = {
    idpName: sessionDataMock.idpName,
    spName: sessionDataMock.spName,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    givenName: spIdentityWithEmailMock.given_name,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    familyName: spIdentityWithEmailMock.family_name,
    today: 'Le 01/01/2021 à 14:14',
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

  describe('hydrateConnectNotificationEmailTemplate', () => {
    beforeEach(() => {
      configServiceMock.get.mockReturnValue(configMailerMock);
      service['configMailer'] = configMailerMock;
    });

    it('hydrated content should match md5 hash (snapshot by hash)', () => {
      // When
      const htmlContent = service.hydrateConnectNotificationEmailTemplate(
        connectNotificationEmailParametersMock,
      );
      const resultMD5 = generateMD5SumFromHTMLContent(htmlContent);
      // Then
      const expectedMD5 = '84fd049f90dde426b9ab516642a553dd';
      expect(resultMD5).toStrictEqual(expectedMD5);
    });
  });

  describe('getTodayFormattedDate', () => {
    it('should return a formatted date to be shown in email notification', () => {
      // When
      const connectNotificationEmailMockedDate = new Date(
        '01 Jan 2021 17:14 GMT+4',
      );
      const result = service.getTodayFormattedDate(
        connectNotificationEmailMockedDate,
      );
      // Then
      expect(result).toStrictEqual(
        connectNotificationEmailParametersMock.today,
      );
    });
  });

  describe('getConnectNotificationEmailBodyContent', () => {
    beforeEach(() => {
      service[
        'hydrateConnectNotificationEmailTemplate'
      ] = jest.fn().mockReturnValue(`connect notification html body content`);

      service['getTodayFormattedDate'] = jest
        .fn()
        .mockReturnValue(connectNotificationEmailParametersMock.today);
    });

    it('should call SessionService.get with interactionId', async () => {
      // When
      await service.getConnectNotificationEmailBodyContent(reqMock);
      // Then
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith(reqMock.fc.interactionId);
    });

    it('should call getTodayFormattedDate', async () => {
      // When
      await service.getConnectNotificationEmailBodyContent(reqMock);
      // Then
      expect(service.getTodayFormattedDate).toBeCalledTimes(1);
      expect(service.getTodayFormattedDate).toBeCalledWith(expect.any(Date));
    });

    it('should throw if any parameters is not valid', async () => {
      // Given
      const sessionDataWithoutEmailMock = {
        idpName: null,
        spName: 'my great SP',
        spIdentity: spIdentityWithoutEmailMock,
      };
      sessionServiceMock.get.mockResolvedValue(sessionDataWithoutEmailMock);
      // When/Then
      const errorMock = new MailerNotificationConnectException();
      await expect(
        service.getConnectNotificationEmailBodyContent(reqMock),
      ).rejects.toThrow(errorMock);
    });

    it('should have called hydrateConnectNotificationEmailTemplate once with parameters', async () => {
      // Given
      jest
        .spyOn(service, 'hydrateConnectNotificationEmailTemplate')
        .mockImplementation();
      // When
      await service.getConnectNotificationEmailBodyContent(reqMock);
      // Then
      expect(
        service.hydrateConnectNotificationEmailTemplate,
      ).toHaveBeenCalledTimes(1);
      expect(
        service.hydrateConnectNotificationEmailTemplate,
      ).toHaveBeenCalledWith(connectNotificationEmailParametersMock);
    });
  });

  describe('handle', () => {
    beforeEach(() => {
      serviceProviderMock.getById.mockResolvedValue(spMock);

      configServiceMock.get.mockReturnValue(configMailerMock);
      service['configMailer'] = configMailerMock;

      service[
        'getConnectNotificationEmailBodyContent'
      ] = jest.fn().mockReturnValue(`connect notification html body content`);
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

    it('should have called getConnectNotificationEmailBodyContent with req as parameter', async () => {
      // When
      await service.handle(reqMock);
      // Then
      expect(service.getConnectNotificationEmailBodyContent).toBeCalledTimes(1);
      expect(service.getConnectNotificationEmailBodyContent).toBeCalledWith(
        reqMock,
      );
    });

    it('should send the email to the end-user by calling "mailer.send"', async () => {
      // Given
      const expectedEmailParams = {
        body: `connect notification html body content`,
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
      const errorMock = new NoEmailException();
      await expect(service.handle(reqMock)).rejects.toThrow(errorMock);
    });
  });
});
