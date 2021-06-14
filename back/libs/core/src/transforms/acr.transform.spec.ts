import { pickAcr } from './acr.transform';

describe('eIDAS transform', () => {
  const defaultValue = 'default_eidas_value';
  const resultMock = 'eidas2';
  const maximumValueMock = 'eidas3';
  const allowedMock = [resultMock, maximumValueMock];

  describe('pickAcr', () => {
    it('should return the minimum eIDAS value if value and config have common value', () => {
      // given
      const value = [resultMock];
      // when
      const result = pickAcr(allowedMock, value, defaultValue);
      // then
      expect(result).toStrictEqual(resultMock);
    });

    it('should return the minimum eIDAS value if values and config have common values', () => {
      // given
      const value = ['eidas2', 'eidas3'];
      // when
      const result = pickAcr(allowedMock, value, defaultValue);
      // then
      expect(result).toStrictEqual(resultMock);
    });

    it('should return the minimum eIDAS value if values and config have some common values', () => {
      // given
      const value = ['eidas2', 'eidas3', 'Harry'];
      // when
      const result = pickAcr(allowedMock, value, defaultValue);
      // then
      expect(result).toStrictEqual(resultMock);
    });

    it('should return the maximum eIDAS value if values and config have not common values', () => {
      // given
      const value = ['Harry', 'Hermione', 'Ron'];
      // when
      const result = pickAcr(allowedMock, value, defaultValue);
      // then
      expect(result).toStrictEqual(maximumValueMock);
    });

    it('should throw an error if value is not an array', () => {
      // given
      const value = 'eidas1';

      expect(
        () =>
          // when
          pickAcr(allowedMock, value as unknown as string[], defaultValue),
        // then
      ).toThrowError('values.filter is not a function');
    });

    it('should return the default eIDAS value if values are wrong and config is empty', () => {
      // given
      const value = ['Harry', 'Hermione', 'Ron'];
      // when
      const result = pickAcr([], value, defaultValue);
      // then
      expect(result).toStrictEqual(defaultValue);
    });
  });
});
