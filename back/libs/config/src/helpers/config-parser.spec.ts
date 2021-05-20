import { mocked } from 'ts-jest/utils';
import { readFileSync } from 'fs';
import { parseBoolean, parseJsonProperty } from '@fc/common';
import { ConfigParser } from './config-parser';

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}));

jest.mock('@fc/common', () => ({
  parseBoolean: jest.fn(),
  parseJsonProperty: jest.fn(),
}));

describe('ConfigParser', () => {
  let reader: ConfigParser;

  const configMock = {
    'someprefix/foo': 'bar',
    'someprefix/bar': '{"fizz":"buzz"}',
    'someprefix/baz': 'true',
    'someprefix/woo': '42',
    'someprefix/zin': '/some/path/to/read.txt',
  };
  const prefixMock = 'someprefix';
  const separatorMock = '/';

  const parseBooleanMock = mocked(parseBoolean);
  const parseJsonPropertyMock = mocked(parseJsonProperty);
  const readFileSyncMock = mocked(readFileSync);

  beforeEach(() => {
    reader = new ConfigParser(configMock, prefixMock, separatorMock);

    jest.resetAllMocks();

    parseBooleanMock.mockReturnValue(true);
    parseJsonPropertyMock.mockReturnValue({ fizz: 'baz' });
    readFileSyncMock.mockReturnValue(Buffer.from('readFileSyncMockValue'));
  });

  describe('constructor', () => {
    it('should use default separator', () => {
      // Given
      const config = {};
      const prefix = 'test';
      // When
      const result = new ConfigParser(config, prefix);
      // Then
      expect(result).toHaveProperty('separator');
      expect(result['separator']).toBe('_');
    });
    it('should use given separator', () => {
      // Given
      const config = {};
      const prefix = 'test';
      const separator = '#';
      // When
      const result = new ConfigParser(config, prefix, separator);
      // Then
      expect(result).toHaveProperty('separator');
      expect(result['separator']).toBe('#');
    });
  });

  describe('getFullPath', () => {
    it('should return prefixed path', () => {
      // Given
      const path = 'blah';
      // When
      const result = reader['getFullPath'](path);
      // Then
      expect(result).toBe('someprefix/blah');
    });
  });

  describe('boolean', () => {
    it('should execute parseBoolean with given value', () => {
      // Given
      const path = 'baz';
      // When
      reader.boolean(path);
      // Then
      expect(parseBooleanMock).toHaveBeenCalledTimes(1);
      expect(parseBooleanMock).toHaveBeenCalledWith(
        configMock['someprefix/baz'],
      );
    });

    it('should return result from parseBoolean', () => {
      // Given
      const path = 'baz';
      const parseBooleanMockReturnValue = Symbol('true');
      parseBooleanMock.mockReturnValue(
        (parseBooleanMockReturnValue as unknown) as boolean,
      );
      // When
      const result = reader.boolean(path);
      // Then
      expect(result).toBe(parseBooleanMockReturnValue);
    });
  });

  describe('json', () => {
    it('should execute parseJsonProperty with given value', () => {
      // Given
      const path = 'baz';
      // When
      reader.json(path);
      // Then
      expect(parseJsonPropertyMock).toHaveBeenCalledTimes(1);
      expect(parseJsonPropertyMock).toHaveBeenCalledWith(
        configMock,
        'someprefix/baz',
      );
    });

    it('should return result from parseJsonProperty', () => {
      // Given
      const path = 'baz';
      const parseJsonPropertyMockReturnValue = Symbol('someobject');
      parseJsonPropertyMock.mockReturnValue(
        (parseJsonPropertyMockReturnValue as unknown) as object,
      );
      // When
      const result = reader.json(path);
      // Then
      expect(result).toBe(parseJsonPropertyMockReturnValue);
    });
  });

  describe('string', () => {
    it('should return simple variable', () => {
      // Given
      const path = 'foo';
      // When
      const result = reader.string(path);
      // Then
      expect(result).toBe('bar');
    });
  });

  describe('number', () => {
    it('should return a number', () => {
      // Given
      const path = 'woo';
      // When
      const result = reader.number(path);
      // Then
      expect(typeof result).toBe('number');
      expect(result).toBe(42);
    });
  });

  describe('file', () => {
    it('should call readfilesync with given path', () => {
      // Given
      const path = 'zin';
      // When
      reader.file(path);
      // Then
      expect(readFileSyncMock).toHaveBeenCalledTimes(1);
      expect(readFileSyncMock).toHaveBeenCalledWith('/some/path/to/read.txt');
    });
    it('should return result of readfilesync buffer .toString', () => {
      // Given
      const path = 'zin';
      // When
      const result = reader.file(path);
      // Then
      expect(result).toBe('readFileSyncMockValue');
    });
  });
});
