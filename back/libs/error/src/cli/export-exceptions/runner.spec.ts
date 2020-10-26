import * as glob from 'glob';
import * as fs from 'fs';
import { FcException } from '@fc/error';
import Runner from './runner';
import MarkdownGenerator from './markdown-generator';

describe('Runner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractException', () => {
    it('Should return the Class extending FcException from a module', () => {
      // Setup
      const MockAbstractFunction = jest.fn();
      class MockException extends FcException {}
      const module = { MockException, MockAbstractFunction };
      // Actions
      const result = Runner.extractException(module);
      // Expect
      expect(result).toStrictEqual(MockException);
    });
  });

  describe('buildException', () => {
    it('Should return the Class extending FcException from a module', () => {
      // Setup
      const MockAbstractFunction = jest.fn();
      class MockException extends FcException {}
      const module = { MockException, MockAbstractFunction };
      // Actions
      const result = Runner.extractException(module);
      // Expect
      expect(result).toStrictEqual(MockException);
    });
  });

  describe('inflateException', () => {
    it('should return null if Exception has invalid scope and/or code', () => {
      // Setup
      const expected = null;
      // Actions
      class MockException extends FcException {}
      const result = Runner.inflateException(MockException);
      // Expect
      expect(result).toStrictEqual(expected);
    });

    it('should return an instance of Error if Exception has valid scope and code', () => {
      // Actions
      class MockException extends FcException {
        public code = 1;
        public scope = 1;
      }
      const result = Runner.inflateException(MockException);
      // Expect
      expect(result instanceof Error).toBe(true);
    });

    it('should return an instance of Error if Exception has valid scope = 0 and code = 0', () => {
      // Actions
      class MockException extends FcException {
        public code = 0;
        public scope = 0;
      }
      const result = Runner.inflateException(MockException);
      // Expect
      expect(result instanceof Error).toBe(true);
    });
  });

  describe('renderFile', () => {
    it('Should reject the promise caused by invalid params', () => {
      // Setup
      const file = 'none.file';
      const obj = [];
      // Actions
      const result = Runner.renderFile(file, obj);
      // Expect
      expect(result).rejects.toMatch('error');
    });
  });

  describe('loadExceptions', () => {
    it('Should return an array of instances of IExceptionDocumentation', async () => {
      // Setup
      const paths = [
        './fixtures/module.exception.fixture',
        './fixtures/module-2.exception.fixture',
      ];
      // Actions
      const result = await Runner.loadExceptions(paths);
      // Expect
      expect(result).toStrictEqual([
        {
          scope: 1,
          code: 2,
          errorCode: 'Y010002',
          message: 'any',
          loggable: true,
          trackable: false,
          description: 'N/A',
        },
        {
          scope: 2,
          code: 2,
          errorCode: 'Y020002',
          message: 'any',
          loggable: true,
          trackable: false,
          description: 'N/A',
        },
      ]);
    });
  });

  describe('getExceptionsFilesPath', () => {
    it('Should return a list of files named as *.exception.ts', () => {
      // Actions
      const found = Runner.getExceptionsFilesPath('@(libs|apps)');
      const tsFiles = found.filter((f) => f.indexOf('.exception.ts') >= 0);
      const noTsFiles = found.filter((f) => f.indexOf('.exception.ts') < 0);
      // Expect
      expect(Array.isArray(found)).toBe(true);
      expect(noTsFiles.length).toEqual(0);
      expect(tsFiles.length).toBeGreaterThanOrEqual(1);
    });

    it('Should return have been called with default parameters', () => {
      // Setup
      jest.mock('glob');
      jest.spyOn(glob, 'sync');
      const basePath = '@(libs|apps)';
      const filePaths = `${basePath}/**/*.exception.ts`;
      // Actions
      Runner.getExceptionsFilesPath();
      // Expect
      expect(glob.sync).toHaveBeenCalledWith(filePaths);
      // Restore
      jest.clearAllMocks();
    });

    it('Should call glob.sync with base path defined @(libs|apps)', () => {
      // Setup
      jest.mock('glob');
      jest.spyOn(glob, 'sync');
      const basePath = '@(libs|apps)';
      const filePaths = `${basePath}/**/*.exception.ts`;
      // Actions
      Runner.getExceptionsFilesPath(basePath);
      // Expect
      expect(glob.sync).toHaveBeenCalledWith(filePaths);
      // Restore
      jest.clearAllMocks();
    });
  });

  describe('run', () => {
    it('Should call fs.writeFileSync to create the markdown file', async () => {
      // Setup
      jest.mock('./runner');
      Runner.loadExceptions = jest.fn();
      Runner.getExceptionsFilesPath = jest.fn();

      jest.mock('./markdown-generator');
      MarkdownGenerator.generate = jest.fn().mockReturnValueOnce([
        [
          {
            errorCode: 'Y0101',
            scope: 1,
            code: 1,
            message: 'any',
            description: 'any',
            trackable: false,
            loggable: false,
          },
        ],
        [
          {
            errorCode: 'Y0201',
            scope: 2,
            code: 1,
            message: 'any',
            description: 'any',
            trackable: false,
            loggable: false,
          },
        ],
      ]);

      jest.mock('fs');
      jest.spyOn(fs, 'writeFileSync');

      // Actions
      await Runner.run();
      // Expect
      expect(fs.writeFileSync).toHaveBeenCalled();
      // Restore
      jest.clearAllMocks();
    });
  });
});
