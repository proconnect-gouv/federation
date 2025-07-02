import * as moment from 'moment-timezone';

import { linesToArray, toArray, toBoolean, toDate } from './string.transform';

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

  describe('linesToArray', () => {
    it('should split a string by line return and ";"', () => {
      // Given
      const value = 'toto\ntiti\rtata\r\ntutu;haha';
      const expected = ['toto', 'titi', 'tata', 'tutu', 'haha'];

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(expected);
    });

    it('should return undefined if it fails', () => {
      // When
      const result = linesToArray(null);

      // Then
      expect(result).toEqual(undefined);
    });

    it('should trim the values and filter empty values', () => {
      // Given
      const value = 'toto\n\n\n  \n\n\ntiti ;  ;';
      const expected = ['toto', 'titi'];

      // When
      const result = linesToArray(value);

      // Then
      expect(result).toEqual(expected);
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
});
