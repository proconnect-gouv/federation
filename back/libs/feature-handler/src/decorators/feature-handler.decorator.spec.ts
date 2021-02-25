import { FeatureHandlerNoHandler } from '../handlers';
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
    it('should retrieve a `FeatureHandlerNoHandler` response for a `null` featureHandler request', async () => {
      // Given
      const emptyFeatureHandlerResponseMock = new FeatureHandlerNoHandler();
      const emptyFeatureHandlerTopicSetMock = 'feature-hanlder-mock';
      const emptyFeatureHandlerTopicGetMock = null;
      // When
      FeatureHandler.cache.set(
        emptyFeatureHandlerTopicSetMock,
        emptyFeatureHandlerResponseMock,
      );
      // Then
      const result = FeatureHandler.get(emptyFeatureHandlerTopicGetMock, ctx);
      expect(result).toStrictEqual(emptyFeatureHandlerResponseMock);
    });

    it('should retrieve a `FeatureHandlerNoHandler` response for a empty string `` featureHandler request', async () => {
      // Given
      const emptyFeatureHandlerResponseMock = new FeatureHandlerNoHandler();
      const emptyFeatureHandlerTopicSetMock = 'feature-hanlder-mock';
      const emptyFeatureHandlerTopicGetMock = '';
      // When
      FeatureHandler.cache.set(
        emptyFeatureHandlerTopicSetMock,
        emptyFeatureHandlerResponseMock,
      );
      // Then
      const result = FeatureHandler.get(emptyFeatureHandlerTopicGetMock, ctx);
      expect(result).toStrictEqual(emptyFeatureHandlerResponseMock);
    });

    it('should throw an `Error` if an `undefined` featureHandler is requested', async () => {
      // Given
      const emptyFeatureHandlerMock = undefined;
      // When
      // Then
      expect(() => FeatureHandler.get(emptyFeatureHandlerMock, ctx)).toThrow(
        new Error(),
      );
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
