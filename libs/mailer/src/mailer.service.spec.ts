import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { MailjetTransport, StdoutTransport } from './transports';
import { MailerService } from './mailer.service';

jest.mock('./transports');

describe('MailerService', () => {
  let service: MailerService;

  const transportSendMock = jest.fn();

  const emailParamsMock = {
    subject: 'subject',
    body: 'body',
    from: {
      email: 'from.email@fqdn.ext',
      name: 'from.name',
    },
    to: [
      {
        email: 'recipient_1@fqdn.ext',
        name: 'recipient_1',
      },
      {
        email: 'recipient_2@fqdn.ext',
        name: 'recipient_2',
      },
    ],
  };

  const configServiceMock = { get: jest.fn() };
  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  const MailjetTransportMock = (MailjetTransport as unknown) as jest.Mock;
  const StdoutTransportMock = (StdoutTransport as unknown) as jest.Mock;

  const mailjetMailerInstanceMock = {
    send: jest.fn(),
  };

  const stdoutMailerInstanceMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, LoggerService, MailerService],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set the logger context', () => {
    // setup
    const constructorName = 'MailerService';

    // expect
    expect(loggerServiceMock.setContext).toBeCalledTimes(1);
    expect(loggerServiceMock.setContext).toBeCalledWith(constructorName);
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      // clear the mocks from the onModuleInit call of the service instanciation
      jest.clearAllMocks();

      MailjetTransportMock.mockReturnValueOnce(mailjetMailerInstanceMock);
      StdoutTransportMock.mockReturnValueOnce(stdoutMailerInstanceMock);
    });

    it('should get the mailer mode from the config', () => {
      // setup
      const configName = 'Mailer';
      const configMock = { transport: 'logs' };
      configServiceMock.get.mockReturnValueOnce(configMock);

      // action
      service.onModuleInit();

      // expect
      expect(configServiceMock.get).toBeCalledTimes(1);
      expect(configServiceMock.get).toBeCalledWith(configName);
    });

    it('should instanciate the StdoutTransport with the logger instance if mailer is "logs"', () => {
      // setup
      const configMock = { transport: 'logs' };
      configServiceMock.get.mockReturnValueOnce(configMock);

      // action
      service.onModuleInit();

      // expect
      expect(StdoutTransportMock).toBeCalledTimes(1);
      expect(StdoutTransportMock).toBeCalledWith(loggerServiceMock);
    });

    it('should instanciate the MailjetTransport with the logger instance if mailer is "mailjet"', () => {
      // setup
      const configMock = { transport: 'mailjet' };
      configServiceMock.get.mockReturnValueOnce(configMock);

      // action
      service.onModuleInit();

      // expect
      expect(MailjetTransportMock).toBeCalledTimes(1);
      expect(MailjetTransportMock).toBeCalledWith(configServiceMock);
    });

    it('should throw an error if mailer is unknown', () => {
      // setup
      const configMock = { transport: 'pouet' };
      const error = new Error('Invalid mailer "pouet"');
      configServiceMock.get.mockReturnValueOnce(configMock);

      // action
      try {
        service.onModuleInit();
      } catch (e) {
        // expect
        expect(MailjetTransportMock).toBeCalledTimes(0);
        expect(StdoutTransportMock).toBeCalledTimes(0);

        expect(e).toBeInstanceOf(Error);
        expect(e.message).toStrictEqual(error.message);
      }
    });
  });

  describe('send', () => {
    beforeEach(() => {
      // clear the mocks from the onModuleInit call of the service instanciation
      jest.clearAllMocks();

      service['transport'] = { send: transportSendMock };
    });

    it('should return a promise', async () => {
      // action
      const result = service.send(emailParamsMock);

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should call the transport "send" function with the mail parameters', async () => {
      // action
      await service.send(emailParamsMock);

      // expect
      expect(service['transport'].send).toHaveBeenCalledTimes(1);
      expect(service['transport'].send).toHaveBeenCalledWith(emailParamsMock);
    });

    it('should log an error if the transport throws', async () => {
      // setup
      const error = Error('oops');
      transportSendMock.mockImplementation(() => {
        throw error;
      });

      // action
      await service.send(emailParamsMock);

      // expect
      expect(loggerServiceMock.error).toHaveBeenCalledTimes(1);
    });
  });
});
