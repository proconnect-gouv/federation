import { FeatureHandler } from './feature-handler.decorator';

const ctx = {
  moduleRef: {
    get: jest.fn(),
  },
};

describe('FeatureHandler exception decorator', () => {
  beforeEach(() => {
    FeatureHandler.cache.clear();
  });

  describe('get()', () => {
    it('should retrieve an empty reponse for an unknown featureHandler', async () => {
      // Given
      const emptyResponseMock = undefined;
      const featureHandlerFakeTopicMock = 'doesnt-exists';
      // When
      FeatureHandler.cache.set(featureHandlerFakeTopicMock, emptyResponseMock);
      // Then
      const result = await FeatureHandler.get(featureHandlerFakeTopicMock, ctx);
      expect(result).toStrictEqual(emptyResponseMock);
    });

    it('should retrieve a instantiated class for a given existing featureHandler', async () => {
      // Given
      const featureHandlerServiceMock = { handle: jest.fn() };
      const featureHandlerTopicMock = 'core-fcp-eidas-verify';
      FeatureHandler.cache.set(
        featureHandlerTopicMock,
        featureHandlerServiceMock,
      );
      ctx.moduleRef.get.mockResolvedValueOnce(featureHandlerServiceMock);
      // When
      const result = await FeatureHandler.get(featureHandlerTopicMock, ctx);
      // Then
      expect(result).toStrictEqual(featureHandlerServiceMock);
    });
  });

  describe('getAll()', () => {
    it('should retrieve the mapping list of all setted FeatureHandler decorator', async () => {
      // Given
      const featureHandlerServiceMock = { handle: jest.fn() };
      const featureHandlerTopicMock = 'core-fcp-eidas-verify';
      FeatureHandler.cache.set(
        featureHandlerTopicMock,
        featureHandlerServiceMock,
      );
      const resultKeysMock = [featureHandlerTopicMock];
      // When
      const result = FeatureHandler.getAll();
      // Then
      expect(result).toStrictEqual(resultKeysMock);
    });
  });
});
