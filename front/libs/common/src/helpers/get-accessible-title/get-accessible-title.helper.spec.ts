import { getAccessibleTitle } from './get-accessible-title.helper';

describe('getAccessibleTitle', () => {
  it('should return undefined if no arguments are provided', () => {
    const result = getAccessibleTitle();
    expect(result).toBeUndefined();
  });

  it('should return the concatenated string if all arguments are defined', () => {
    const result = getAccessibleTitle('Title', 'Subtitle', 'Description');
    expect(result).toBe('Title - Subtitle - Description');
  });

  it('should ignore undefined arguments and return the concatenated string', () => {
    const result = getAccessibleTitle('Title', undefined, 'Description');
    expect(result).toBe('Title - Description');
  });

  it('should return undefined if all arguments are undefined', () => {
    const result = getAccessibleTitle(undefined, undefined, undefined);
    expect(result).toBeUndefined();
  });
});
