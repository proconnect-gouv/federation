import { pickAcr, DEFAULT_EIDAS } from './acr.transform';

describe('eIDAS transform', () => {
  const resultMock = 'eidas2';
  const maximumValueMock = 'eidas3';
  const allowedMock = [resultMock, maximumValueMock];

  describe('pickAcr', () => {
    it('should return the minimum eIDAS value if value and config have common value', () => {
      // setup
      const value = [resultMock];
      // action
      const result = pickAcr(allowedMock, value);
      // assert
      expect(result).toStrictEqual(resultMock);
    });

    it('should return the minimum eIDAS value if values and config have common values', () => {
      // setup
      const value = ['eidas2', 'eidas3'];
      // action
      const result = pickAcr(allowedMock, value);
      // assert
      expect(result).toStrictEqual(resultMock);
    });

    it('should return the minimum eIDAS value if values and config have some common values', () => {
      // setup
      const value = ['eidas2', 'eidas3', 'Harry'];
      // action
      const result = pickAcr(allowedMock, value);
      // assert
      expect(result).toStrictEqual(resultMock);
    });

    it('should return the maximum eIDAS value if values and config have not common values', () => {
      // setup
      const value = ['Harry', 'Hermione', 'Ron'];
      // action
      const result = pickAcr(allowedMock, value);
      // assert
      expect(result).toStrictEqual(maximumValueMock);
    });

    it('should throw an error if value is not an array', () => {
      // setup
      const value = 'eidas1';

      expect(
        () =>
          // action
          pickAcr(allowedMock, (value as unknown) as string[]),
        // assert
      ).toThrowError('values.map is not a function');
    });

    it('should return the default eIDAS value if values are wrong and config is empty', () => {
      // setup
      const value = ['Harry', 'Hermione', 'Ron'];
      // action
      const result = pickAcr([], value);
      // assert
      expect(result).toStrictEqual(DEFAULT_EIDAS);
    });
  });
});
