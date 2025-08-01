import * as moment from 'moment-timezone';

import {
  arrayToLines,
  defaultNoneOrLinesToNullableArray,
  linesToArray,
  nullableArrayToDefaultNoneOrLines,
  toArray,
  toBoolean,
  toDate,
  toNullableString,
} from './string.transform';

describe('String transform', () => {
  describe('toDate', () => {
    const format = 'YYYY-MM-DD';
    const wrongFormat = 'YYY-MM-D';
    const date = '2020-09-10';

    it('should return a function', () => {
      // When
      const valid = toDate(format);

      // Then
      expect(valid).toBeInstanceOf(Function);
    });

    it('should return a function that return a Date', () => {
      // When
      const valid = toDate(format);

      // Then
      expect(valid(date)).toBeInstanceOf(Date);
    });

    it('should return a function that return a Date with the right format: YYYY-MM-DD', () => {
      // Given
      const myFunc = toDate(format);
      const expected = moment(date, format).toDate();

      // When
      const valid = myFunc(date);

      // Then
      expect(valid).toEqual(expected);
    });

    it('should return undefined if the date format is not YYYY-MM-DD', () => {
      // Given
      const myFunc = toDate(wrongFormat);

      // When
      const valid = myFunc(date);

      // Then
      expect(valid).toEqual(undefined);
    });
  });

  describe('toBoolean', () => {
    it('should return true if value is true', () => {
      // Given
      const value = 'true';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(true);
    });

    it('should return true if value is on', () => {
      // Given
      const value = 'on';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(true);
    });

    it('should return true if value is 1', () => {
      // Given
      const value = '1';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(true);
    });

    it('should return true if value is yes', () => {
      // Given
      const value = 'yes';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(true);
    });

    it('should return false if value is false', () => {
      // Given
      const value = 'false';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(false);
    });

    it('should return false if value is off', () => {
      // Given
      const value = 'off';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(false);
    });

    it('should return false if value is 0', () => {
      // Given
      const value = '0';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(false);
    });

    it('should return false if value is no', () => {
      // Given
      const value = 'no';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(false);
    });

    it('should return undefined if value is not a boolean', () => {
      // Given
      const value = 'toto';

      // When
      const result = toBoolean(value);

      // Then
      expect(result).toEqual(undefined);
    });
  });

  describe('toArray', () => {
    it('should return an array if a string is provided', () => {
      // Given
      const value = 'toto';

      // When
      const result = toArray(value);

      // Then
      expect(result).toEqual([value]);
    });

    it('should return an array if an array is provided', () => {
      // Given
      const value = ['toto'];

      // When
      const result = toArray(value);

      // Then
      expect(result).toEqual(value);
    });
  });

  describe('linesToArray', () => {
    it('should split string by newline', () => {
      // Given
      const value = 'line1\nline2\nline3';

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should split string by carriage return', () => {
      // Given
      const value = 'line1\rline2\rline3';

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should split string by carriage return and newline', () => {
      // Given
      const value = 'line1\r\nline2\r\nline3';

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should split string by semicolon', () => {
      // Given
      const value = 'line1;line2;line3';

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should trim values', () => {
      // Given
      const value = ' line1 ; line2 ; line3 ';

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(['line1', 'line2', 'line3']);
    });

    it('should filter out empty values', () => {
      // Given
      const value = 'line1;;line3';

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(['line1', 'line3']);
    });

    it('should return undefined on error', () => {
      // Given
      const value = null;

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(undefined);
    });
  });

  describe('arrayToLines', () => {
    it('should join array with carriage return and newline', () => {
      // Given
      const value = ['line1', 'line2', 'line3'];

      // When
      const result = arrayToLines(value);

      // Then
      expect(result).toEqual('line1\r\nline2\r\nline3');
    });

    it('should return the value if it is not an array', () => {
      // Given
      const value = 'not an array';

      // When
      const result = arrayToLines(value);

      // Then
      expect(result).toEqual(value);
    });
  });

  describe('defaultNoneOrLinesToNullableArray', () => {
    it('should return null if value is "default"', () => {
      // Given
      const value = 'default';

      // When
      const result = defaultNoneOrLinesToNullableArray(value);

      // Then
      expect(result).toEqual(null);
    });

    it('should return null if value is falsy', () => {
      // Given
      const value = '';

      // When
      const result = defaultNoneOrLinesToNullableArray(value);

      // Then
      expect(result).toEqual(null);
    });

    it('should return empty array if value is "none"', () => {
      // Given
      const value = 'none';

      // When
      const result = defaultNoneOrLinesToNullableArray(value);

      // Then
      expect(result).toEqual([]);
    });

    it('should return array of lines for other values', () => {
      // Given
      const value = 'line1\nline2';

      // When
      const result = defaultNoneOrLinesToNullableArray(value);

      // Then
      expect(result).toEqual(['line1', 'line2']);
    });
  });

  describe('nullableArrayToDefaultNoneOrLines', () => {
    it('should return "default" if value is falsy', () => {
      // Given
      const value = null;

      // When
      const result = nullableArrayToDefaultNoneOrLines(value);

      // Then
      expect(result).toEqual('default');
    });

    it('should return "none" if value is an empty array', () => {
      // Given
      const value = [];

      // When
      const result = nullableArrayToDefaultNoneOrLines(value);

      // Then
      expect(result).toEqual('none');
    });

    it('should return joined lines if value is a non-empty array', () => {
      // Given
      const value = ['line1', 'line2'];

      // When
      const result = nullableArrayToDefaultNoneOrLines(value);

      // Then
      expect(result).toEqual('line1\r\nline2');
    });

    it('should return the value if it is not an array', () => {
      // Given
      const value = 'not an array';

      // When
      const result = nullableArrayToDefaultNoneOrLines(value);

      // Then
      expect(result).toEqual(value);
    });
  });

  describe('toNullableString', () => {
    it('should return the value if it is truthy', () => {
      // Given
      const value = 'some string';

      // When
      const result = toNullableString(value);

      // Then
      expect(result).toEqual(value);
    });

    it('should return null if value is falsy', () => {
      // Given
      const value = '';

      // When
      const result = toNullableString(value);

      // Then
      expect(result).toEqual(null);
    });
  });
});
