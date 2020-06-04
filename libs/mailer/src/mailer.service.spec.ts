import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { MailerService } from './mailer.service';
import * as Mailers from './transports';

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

  const mailjetMailerInstanceMock = {
    send: jest.fn(),
  };
  const MailjetTransportMock = jest
    .fn()
    .mockReturnValueOnce(mailjetMailerInstanceMock);

  const stdoutMailerInstanceMock = {
    send: jest.fn(),
  };
  const StdoutTransportMock = jest
    .fn()
    .mockReturnValueOnce(stdoutMailerInstanceMock);

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

      jest
        .spyOn(Mailers, 'MailjetTransport')
        .mockImplementationOnce(MailjetTransportMock);
      jest
        .spyOn(Mailers, 'StdoutTransport')
        .mockImplementationOnce(StdoutTransportMock);
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
      expect(Mailers.StdoutTransport).toBeCalledTimes(1);
      expect(Mailers.StdoutTransport).toBeCalledWith(loggerServiceMock);
    });

    it('should instanciate the MailjetTransport with the logger instance if mailer is "mailjet"', () => {
      // setup
      const configMock = { transport: 'mailjet' };
      configServiceMock.get.mockReturnValueOnce(configMock);

      // action
      service.onModuleInit();

      // expect
      expect(Mailers.MailjetTransport).toBeCalledTimes(1);
      expect(Mailers.MailjetTransport).toBeCalledWith(configServiceMock);
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
        expect(Mailers.MailjetTransport).toBeCalledTimes(0);
        expect(Mailers.StdoutTransport).toBeCalledTimes(0);

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
