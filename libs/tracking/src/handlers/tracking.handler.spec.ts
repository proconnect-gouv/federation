import { Test, TestingModule } from '@nestjs/testing';
import { TrackingService } from '../tracking.service';
import { TrackingHandler } from './tracking.handler';
import { IEvent } from '../interfaces';

describe('TrackingHandler', () => {
  let handler: TrackingHandler;

  class TrackingHandlerMock extends TrackingHandler {}

  const trackingMock = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TrackingHandler,
          useClass: TrackingHandlerMock,
        },
        TrackingService,
      ],
    })
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .compile();

    handler = module.get<TrackingHandler>(TrackingHandler);

    jest.resetAllMocks();
  });

  describe('log', () => {
    it('Should call TrackingService.log', () => {
      // Given
      const eventDefinition = (Symbol('eventDef') as unknown) as IEvent;
      const event = {
        req: {
          ip: 'ipMock',
          fc: { interactionId: 'interactionIdMock' },
        },
      };
      // When
      handler['log'](eventDefinition, event);
      // Then
      expect(trackingMock.log).toBeCalledTimes(1);
      expect(trackingMock.log).toHaveBeenCalledWith(eventDefinition, event);
    });
  });
});
