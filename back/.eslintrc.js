/**
 * According to the OIDC specification, certain parameters must use snake_case naming conventions.
 * To avoid adding ESLint ignore comments for each line where these parameters are used,
 * we configure ESLint to ignore these specific variable names in the naming-convention rule.
 * Also, certain business logic force us using snake_case naming conventions.
 */
const allowedSnakeCaseParameters = [
  'access_token',
  'acr_values',
  'application_type',
  'authorization_endpoint',
  'belonging_population',
  'check_session',
  'chorusdt_matricule',
  'chorusdt_societe',
  'client_id',
  'client_secret',
  'code_challenge',
  'code_challenge_method',
  'code_verifier',
  'code_verification',
  'device_authorization',
  'email_verified',
  'end_session',
  'end_session_endpoint',
  'error_description',
  'error_detail',
  'error_uri',
  'family_name',
  'given_name',
  'given_name_array',
  'grant_types',
  'grant_types_supported',
  'id_token',
  'id_token_encrypted_response_alg',
  'id_token_encrypted_response_enc',
  'id_token_hint',
  'id_token_signed_response_alg',
  'idp_acr',
  'idp_birthdate',
  'idp_hint',
  'idp_id',
  'introspection_encrypted_response_alg',
  'introspection_encrypted_response_enc',
  'introspection_signed_response_alg',
  'is_service_public',
  'jwks_uri',
  'login_hint',
  'siret_hint',
  'middle_name',
  'organizational_unit',
  'phone_number',
  'phone_number_verified',
  'post_logout_redirect_uri',
  'post_logout_redirect_uris',
  'postal_code',
  'preferred_username',
  'pushed_authorization_request',
  'redirect_uri',
  'redirect_uris',
  'refresh_token',
  'response_mode',
  'response_type',
  'response_types',
  'revocation_endpoint_auth_method',
  'send_transactional',
  'remember_me',
  'sp_id',
  'sp_name',
  'street_address',
  'token_endpoint',
  'token_endpoint_auth_method',
  'token_introspection',
  'token_type',
  'updated_at',
  'userinfo_encrypted_response_alg',
  'userinfo_encrypted_response_enc',
  'userinfo_endpoint',
  'userinfo_signed_response_alg',
  'usual_name',
  'http_status_code',
];

const allowedSnakeCaseParametersRegexPattern = `^(${allowedSnakeCaseParameters.join('|')})$`;

module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: [
    'plugin:@eslint-community/eslint-comments/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'prettier',
  ],
  ignorePatterns: ['**/*.ejs'],
  overrides: [
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
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'simple-import-sort', 'import'],
  root: true,
  rules: {
    '@eslint-community/eslint-comments/no-unused-disable': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Function: false,
          object: false,
        },
      },
    ],
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],

        leadingUnderscore: 'allow',
        // Enforce that all variables, functions and properties follow are camelCase
        selector: 'variableLike',
        filter: {
          regex: allowedSnakeCaseParametersRegexPattern,
          match: false,
        },
      },
      {
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        // Enforce that all variables are either in camelCase or UPPER_CASE
        selector: 'memberLike',
        filter: {
          regex: allowedSnakeCaseParametersRegexPattern,
          match: false,
        },
      },
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
    'max-depth': ['error', { max: 2 }],
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
          // NodeJS packages/libraries
          // +more si besoin
          ['^fs$', '^path$', '^crypto$'],
          // Things that start with a letter
          ['^@?\\w'],
          //
          ['^@nestjs'],
          ['^@entities/'],
          ['^@fc/'],
          ['^@mocks/'],
          // Anything not matched in another group.
          ['^'],
          // Relative imports.
          ['^\\.'],
        ],
      },
    ],
    'sort-imports': 'off',
    'require-await': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
  },
};
