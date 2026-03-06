import { defineConfig } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import cypress from 'eslint-plugin-cypress';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import _import from 'eslint-plugin-import';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';
import sortKeysFix from 'eslint-plugin-sort-keys-fix';
import { fixupPluginRules } from '@eslint/compat';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: [
      ...compat.extends(
        'plugin:@eslint-community/eslint-comments/recommended',
        'plugin:@typescript-eslint/recommended',
        'eslint:recommended',
        'prettier',
      ),
    ],

    plugins: {
      '@typescript-eslint': typescriptEslint,
      cypress,
      'simple-import-sort': simpleImportSort,
      import: fixupPluginRules(_import),
      'sort-destructure-keys': sortDestructureKeys,
      'sort-keys-fix': sortKeysFix,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      parserOptions: {
        project: true,
      },
    },

    rules: {
      'no-console': 2,
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 2,
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/naming-convention': [
        'error',
        {
          format: null,
          selector: 'property',
          modifiers: ['requiresQuotes'],
        },
      ],

      'cypress/unsafe-to-chain-command': 'error',
      'import/first': 2,
      'import/newline-after-import': 2,
      'import/no-anonymous-default-export': 2,
      'import/no-duplicates': 2,
      'linebreak-style': 'off',

      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      'padding-line-between-statements': [
        2,
        {
          blankLine: 'always',
          prev: ['function'],
          next: '*',
        },
      ],

      'simple-import-sort/exports': 2,

      'simple-import-sort/imports': [
        2,
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
      'sort-keys-fix/sort-keys-fix': 2,
      'sort-destructure-keys/sort-destructure-keys': 2,

      'sort-keys': [
        2,
        'asc',
        {
          caseSensitive: true,
          natural: false,
          minKeys: 2,
        },
      ],
    },
  },
]);
