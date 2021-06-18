import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { CsmrTracksController } from './csmr-tracks.controller';
import { CsmrTracksService } from './csmr-tracks.service';

describe('CsmrTracksController', () => {
  let controller: CsmrTracksController;

  const loggerMock = {
    debug: jest.fn(),
    trace: jest.fn(),
    setContext: jest.fn(),
  };

  const csmrTracksMock = {
    getList: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CsmrTracksController],
      providers: [LoggerService, CsmrTracksService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(CsmrTracksService)
      .useValue(csmrTracksMock)
      .compile();

    controller = app.get<CsmrTracksController>(CsmrTracksController);
  });

  describe('getTracks', () => {
    it('should return result of CsmrTracksService.getList', async () => {
      // Given
      const payloadMock = {
        pattern: 'SOME_PATTERN',
        data: {},
      };
      const expected = 'some string';
      csmrTracksMock.getList.mockResolvedValueOnce(expected);
      // When
      const result = await controller.getTracks(payloadMock);
      // Then
      expect(result).toEqual(expected);
    });
  });
});
