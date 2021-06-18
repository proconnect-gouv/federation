import { Test, TestingModule } from '@nestjs/testing';
import { CsmrTracksService } from './csmr-tracks.service';
import { mockedData } from './temp-mock-tracks-data';

describe('CsmrTracksService', () => {
  let service: CsmrTracksService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CsmrTracksService],
      providers: [],
    }).compile();

    service = app.get<CsmrTracksService>(CsmrTracksService);
  });

  describe('getList', () => {
    it('should return JSON stringified mock data', async () => {
      // Given
      const identityMock = {};
      const expected = JSON.stringify(mockedData);
      // When
      const result = await service.getList(identityMock);
      // Then
      expect(result).toEqual(expected);
    });
  });
});
