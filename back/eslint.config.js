import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import typescriptEslintEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { defineConfig, globalIgnores } from 'eslint/config';
import _import from 'eslint-plugin-import';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';

export default defineConfig([
  globalIgnores(['**/*.ejs']),
  comments.recommended,
  js.configs.recommended,
  {
    plugins: {
      prettier: eslintPluginPrettierRecommended.plugins.prettier,
      '@typescript-eslint': typescriptEslintEslintPlugin,
      'simple-import-sort': simpleImportSort,
      import: fixupPluginRules(_import),
    },

    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: null,
          selector: 'property',
          modifiers: ['requiresQuotes'],
        },
      ],

      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',

      'max-depth': [
        'error',
        {
          max: 2,
        },
      ],

      'max-statements-per-line': [
        'error',
        {
          max: 1,
        },
      ],

      'no-param-reassign': 'error',
      'simple-import-sort/exports': 'error',

      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            ['^\\u0000'],
            ['^fs$', '^path$', '^crypto$'],
            ['^@?\\w'],
            ['^@nestjs'],
            ['^@entities/'],
            ['^@fc/'],
            ['^@mocks/'],
            ['^'],
            ['^\\.'],
          ],
        },
      ],

      'sort-imports': 'off',
      'require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['**/*.ejs'],
    rules: {},
  },
  {
    files: ['**/*.spec.ts', '**/*.spec.js'],

    rules: {
      'max-nested-callbacks': 'off',
    },
  },
]);
