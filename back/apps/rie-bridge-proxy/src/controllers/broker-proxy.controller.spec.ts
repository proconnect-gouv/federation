import { Test, TestingModule } from '@nestjs/testing';

import { LoggerService } from '@fc/logger';

import { BrokerProxyController } from './broker-proxy.controller';

describe('BrokerProxyController', () => {
  let controller: BrokerProxyController;

  const loggerServiceMock = {
    setContext: jest.fn(),
  } as unknown as LoggerService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrokerProxyController],
      providers: [LoggerService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    controller = module.get<BrokerProxyController>(BrokerProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
