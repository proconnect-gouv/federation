module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './*/tsconfig.json',
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import',
    'simple-import-sort',
    "sort-destructure-keys",
    "sort-keys-fix",
    'typescript-sort-keys',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:typescript-sort-keys/recommended',
    'prettier',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['**/*.ejs'],
  overrides: [
    {
      files: ['**/*.ejs'],
      rules: {},
    },
  ],
  rules: {
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          object: false,
          Function: false,
        },
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        // Enforce that all variables, functions and properties follow are camelCase
        selector: 'variableLike',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
      {
        // Enforce that all variables are either in camelCase or UPPER_CASE
        selector: 'memberLike',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    complexity: ['error', { max: 4 }],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'max-depth': ['error', { max: 2 }],
    'max-params': ['error', { max: 4 }],
    'max-statements-per-line': ['error', { max: 1 }],
    'no-param-reassign': 'error',
    'no-unused-vars': 'off',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // CSS... Side effect imports.
          ['^\\u0000'],
          // NodeJS packages
          ['fs', 'path', 'crypto'],
          // Things that start with a letter
          ['^@?\\w'],
          //
          ['^@nestjs'],
          ['^@fc'],
          // Anything not matched in another group.
          ['^'],
          // Relative imports.
          ['^\\.'],
        ],
      },
    ],
    'sort-imports': 'off',
    "sort-destructure-keys/sort-destructure-keys": 2,
    "sort-keys": [
      "error",
      "asc",
      { "caseSensitive": true, "natural": false, "minKeys": 2 }
    ],
    "sort-keys-fix/sort-keys-fix": 2,
  },
};
