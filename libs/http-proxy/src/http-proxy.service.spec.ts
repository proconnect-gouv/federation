import * as globalAgent from 'global-agent';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpProxyService } from './http-proxy.service';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';

jest.mock('global-agent');

describe('HttpProxyService', () => {
  let service: HttpProxyService;

  const httpsProxyValueMock = 'httpsProxyValueMock';
  const configMock = {
    get: jest.fn(),
  };

  const loggerMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
  };

  const agentMock = { HTTP_PROXY: undefined, HTTPS_PROXY: undefined };

  const createGlobalProxyAgentMock = jest.spyOn(
    globalAgent,
    'createGlobalProxyAgent',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpProxyService, LoggerService, ConfigService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    service = module.get<HttpProxyService>(HttpProxyService);

    jest.resetAllMocks();

    configMock.get.mockReturnValue({
      httpsProxy: httpsProxyValueMock,
    });

    createGlobalProxyAgentMock.mockReturnValue(agentMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call config service', () => {
      // When
      service.onModuleInit();
      // Then
      expect(configMock.get).toHaveBeenCalledTimes(1);
      expect(configMock.get).toHaveBeenCalledWith('HttpProxy');
    });
    it('should call createGlobalProxyAgent', () => {
      // When
      service.onModuleInit();
      // Then
      expect(createGlobalProxyAgentMock).toHaveBeenCalledTimes(1);
    });
    it('should set agent variables', () => {
      // When
      service.onModuleInit();
      // Then
      expect(agentMock.HTTPS_PROXY).toBe(httpsProxyValueMock);
    });
  });
});
