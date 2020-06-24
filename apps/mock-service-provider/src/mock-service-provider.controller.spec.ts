import { Test, TestingModule } from '@nestjs/testing';
import { MockServiceProviderController } from './mock-service-provider.controller';

describe('MockServiceProviderController', () => {
  let controller: MockServiceProviderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MockServiceProviderController],
    }).compile();

    controller = module.get<MockServiceProviderController>(
      MockServiceProviderController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
