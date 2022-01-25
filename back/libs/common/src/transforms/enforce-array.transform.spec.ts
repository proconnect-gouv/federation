import { enforceArray } from './enforce-array.transform';

describe('Enforce array transform', () => {
  describe('enforceArray', () => {
    it('should return an array from a single string', () => {
      // Given
      const options = { value: 'foo' };

      // When
      const result = enforceArray(options);

      // Then
      expect(result).toEqual([options.value]);
    });

    it('should return an array from array', () => {
      // Given
      const options = { value: ['foo', 'bar'] };

      // When
      const result = enforceArray(options);

      // Then
      expect(result).toEqual(options.value);
    });
  });
});
