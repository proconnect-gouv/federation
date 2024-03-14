module.exports = {
  env: {
    node: true,
    es2020: true,
    browser: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:import/react',
    'plugin:import/typescript',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:prettier/recommended',
  ],
  globals: {},
  ignorePatterns: [
    '**/tmp',
    '**/temp',
    '**/dist',
    '**/build',
    '**/public',
    '**/scripts',
    '**/coverage',
    '**/node_modules',
    '**/__mocks__',
    '**/__fixtures__',
    '**/__snapshots__',
    '**/*.css',
    '**/*.scss',
    // @NOTE
    // Ces deux fichiers semblent être problématique pour eslint
    // C'est la regle jest/unbound-method qui pose ici probleme
    '**/jest.config.js',
    '**/vite.config.js',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaFeatures: {
      jsx: true,
      generators: false,
      objectLiteralDuplicateProperties: false,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['simple-import-sort', 'prettier'],
  reportUnusedDisableDirectives: true,
  rules: {
    'class-methods-use-this': [
      2,
      {
        exceptMethods: [
          'render',
          'getInitialState',
          'getDefaultProps',
          'getChildContext',
          'componentWillMount',
          'UNSAFE_componentWillMount',
          'componentDidMount',
          'componentWillReceiveProps',
          'UNSAFE_componentWillReceiveProps',
          'shouldComponentUpdate',
          'componentWillUpdate',
          'UNSAFE_componentWillUpdate',
          'componentDidUpdate',
          'componentWillUnmount',
          'componentDidCatch',
          'getSnapshotBeforeUpdate',
        ],
        enforceForClassFields: true,
      },
    ],
    'no-else-return': 2,
    'dot-notation': 0,
    'no-console': 2,
    'simple-import-sort/imports': [
      2,
      {
        groups: [
          ['^\\u0000'],
          ['^fs$', '^path$', '^crypto$'],
          ['^@?\\w'],
          ['^@fc/'],
          ['^'],
          ['^\\.'],
        ],
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
