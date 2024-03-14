module.exports = {
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['react'],
      rules: {
        'react/jsx-key': 2,
        'react/jsx-props-no-spreading': [
          2,
          {
            html: 'enforce',
            custom: 'enforce',
            explicitSpread: 'ignore',
            exceptions: ['input'],
          },
        ],
        'react/jsx-sort-props': [
          2,
          {
            noSortAlphabetically: false,
            ignoreCase: true,
            callbacksLast: true,
            shorthandFirst: true,
            reservedFirst: true,
            multiline: 'ignore',
            locale: 'auto',
          },
        ],
        'react/no-unstable-nested-components': 2,
        'react/react-in-jsx-scope': 0,
      },
    },
  ],
};
