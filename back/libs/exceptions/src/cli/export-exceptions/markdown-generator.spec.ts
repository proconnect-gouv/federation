import { ExceptionDocumentationInterface } from '@fc/exceptions/types';

import MarkdownGenerator from './markdown-generator';

describe('MarkdownGenerator', () => {
  describe('MarkdownGenerator.removeExceptionsWithoutCode', () => {
    it('should remove any error without a code property', () => {
      const errs = [
        { code: 3 },
        {},
        { code: 2 },
      ] as ExceptionDocumentationInterface[];
      const result = errs.filter(MarkdownGenerator.removeExceptionsWithoutCode);
      const expected = [{ code: 3 }, { code: 2 }];
      expect(result).toStrictEqual(expected);
    });
  });

  describe('MarkdownGenerator.sortByCode', () => {
    it('should order errors by scope then by code properties', () => {
      const errs = [
        { code: 3, scope: 2 },
        { code: 2, scope: 1 },
        { code: 1, scope: 1 },
      ] as ExceptionDocumentationInterface[];
      const result = errs.sort(MarkdownGenerator.sortByCode);
      const expected = [
        { code: 1, scope: 1 },
        { code: 2, scope: 1 },
        { code: 3, scope: 2 },
      ];
      expect(result).toStrictEqual(expected);
    });
  });

  describe('MarkdownGenerator.groupExceptionsByScope', () => {
    it('should group exceptions with the same scope property', () => {
      const errs = [
        { scope: 3, ui: '3.1' },
        { scope: 3, ui: '3.2' },
        { scope: 2, ui: '2.1' },
      ];
      const result = errs.reduce(MarkdownGenerator.groupExceptionsByScope, {});
      const expected = {
        3: [
          { scope: 3, ui: '3.1' },
          { scope: 3, ui: '3.2' },
        ],
        2: [{ scope: 2, ui: '2.1' }],
      };
      expect(result).toStrictEqual(expected);
    });
  });

  describe('MarkdownGenerator.generate', () => {
    it('should generate a markdown document from a stack of errors', () => {
      const errors = [
        {
          errorCode: 'Y0101',
          scope: 1,
          code: 1,
          ui: 'any',
          description: 'any',
          trackable: false,
          loggable: false,
          path: 'path/to/file.exception.ts',
          exception: 'notWorkingBuddy',
        },
        {
          errorCode: 'Y0201',
          scope: 2,
          code: 1,
          ui: 'any',
          description: 'any',
          trackable: false,
          loggable: false,
          path: 'path/to/file.exception.ts',
          exception: 'notWorkingBuddy',
        },
      ];
      const result = MarkdownGenerator.generate(
        errors as unknown as ExceptionDocumentationInterface[],
      );
      const expected = [
        [
          {
            errorCode: 'Y0101',
            scope: 1,
            code: 1,
            ui: 'any',
            description: 'any',
            trackable: false,
            loggable: false,
            path: 'path/to/file.exception.ts',
            exception: 'notWorkingBuddy',
          },
        ],
        [
          {
            errorCode: 'Y0201',
            scope: 2,
            code: 1,
            ui: 'any',
            description: 'any',
            trackable: false,
            loggable: false,
            path: 'path/to/file.exception.ts',
            exception: 'notWorkingBuddy',
          },
        ],
      ];
      expect(result).toStrictEqual(expected);
    });
  });

  describe('MarkdownGenerator.checkForDuplicatedCodes', () => {
    it('should throw an error if there are duplicated error codes', () => {
      const errors = [
        { errorCode: 'Y0101' },
        { errorCode: 'Y0101' },
        { errorCode: 'Y0201' },
      ];

      jest.spyOn(console, 'log').mockImplementation(() => {});

      MarkdownGenerator.checkForDuplicatedCodes(
        errors as unknown as ExceptionDocumentationInterface[],
      );

      /**
       * @todo #1988 Fix inconsistent usage of codes and scopes across the codebase
       *
       * UT for throwing code:
       *
       * expect(() => MarkdownGenerator.checkForDuplicatedCodes(errors)).toThrow(
       *    'Error code Y0101 is duplicated',
       *  );
       *
       * UT for temporary behavior (just log error):
       */
      expect(console.log).toHaveBeenCalledWith(
        'Error code Y0101 is duplicated',
      );
    });
  });
});
