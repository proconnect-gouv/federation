module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './*/tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier',
    'prettier/@typescript-eslint',
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
    'max-depth': ['error', { max: 2 }],
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
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          object: false,
          Function: false,
        },
      },
    ],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-param-reassign': 'error',
  },
};
