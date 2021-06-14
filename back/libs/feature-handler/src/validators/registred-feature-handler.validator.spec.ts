import { FeatureHandler } from '../decorators';
import { IsRegisteredFeatureHandlerConstraint } from './registered-feature-handler.validator';

describe('IsRegisteredFeatureHandler', () => {
  describe('IsRegisteredFeatureHandlerConstraint', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should return false if input is null', () => {
      // Given
      const input = null;
      const validator = new IsRegisteredFeatureHandlerConstraint();
      // When
      const result = validator.validate(input);
      // Then
      expect(result).toBeFalsy();
    });

    it('should return false if input is undefined', () => {
      // Given
      const input = undefined;
      const validator = new IsRegisteredFeatureHandlerConstraint();
      // When
      const result = validator.validate(input);
      // Then
      expect(result).toBeFalsy();
    });

    it('should return false if input is a string', () => {
      // Given
      const input = 'some String' as unknown as any;
      const validator = new IsRegisteredFeatureHandlerConstraint();
      // When
      const result = validator.validate(input);
      // Then
      expect(result).toBeFalsy();
    });

    it('should return false if input is a number', () => {
      // Given
      const input = 42 as unknown as any;
      const validator = new IsRegisteredFeatureHandlerConstraint();
      // When
      const result = validator.validate(input);
      // Then
      expect(result).toBeFalsy();
    });

    it('should return true if input is an object with registred handler', () => {
      // Given
      const registredHandler = 'myRegistredHandler';
      const askedHandler = registredHandler;
      jest
        .spyOn(FeatureHandler, 'getAll')
        .mockImplementationOnce(() => [registredHandler]);

      const input = { bar: askedHandler };
      const validator = new IsRegisteredFeatureHandlerConstraint();
      // When
      const result = validator.validate(input);
      // Then
      expect(result).toBeTruthy();
    });

    it('should return false if input is an object without registred handler', () => {
      // Given
      const registredHandler = 'myRegistredHandler';
      const askedHandler = 'anotherHandler';
      jest
        .spyOn(FeatureHandler, 'getAll')
        .mockImplementationOnce(() => [registredHandler]);

      const input = { bar: askedHandler };
      const validator = new IsRegisteredFeatureHandlerConstraint();
      // When
      const result = validator.validate(input);
      // Then
      expect(result).toBeFalsy();
    });
  });
});
