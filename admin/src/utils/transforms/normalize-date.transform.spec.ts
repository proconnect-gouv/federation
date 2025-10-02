import { normalizeDate } from './normalize-date.transform';

describe('normalizeDate', () => {
  it('should return an untouched value if it begins with year', () => {
    // Given
    const input = '1992-04-23';

    // When
    const result = normalizeDate(input);

    // Then
    expect(result).toStrictEqual(input);
  });

  it('should reformat DD/mm/YYYY to YYYY-mm-DD', () => {
    // Given
    const input = '04/07/1994';
    const expected = '1994-07-04';

    // When
    const result = normalizeDate(input);

    // Then
    expect(result).toStrictEqual(expected);
  });

  it('should reformat DD-mm-YYYY to YYYY-mm-DD', () => {
    // Given
    const input = '04-07-1994';
    const expected = '1994-07-04';

    // When
    const result = normalizeDate(input);

    // Then
    expect(result).toStrictEqual(expected);
  });
});
