const path = require('path');

const tsConfig = require('../tsconfig.app.json');

module.exports = {
  stories: ['../@(libs|apps)/**/*.stories.tsx'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  framework: '@storybook/react',
  core: {
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: async (config) => {
    // Manage project aliases
    const removeTrailingStarsAndRelativePath = (str) => str.replace(/(\.{2}\/)|(\/?\*)/g, '');
    const tsConfigAliases = Object.entries(tsConfig.compilerOptions.paths).reduce(
      (aliases, [from, to]) => ({
        ...aliases,
        [removeTrailingStarsAndRelativePath(from)]: path.resolve(
          __dirname,
          '..',
          removeTrailingStarsAndRelativePath(to[0]),
        ),
      }),
      {},
    );

    config.resolve.alias = {
      ...config.resolve.alias,
      ...tsConfigAliases,
    };

    config.module.rules.push({
      test: /(\.module)?\.(scss|sass)$/,
      use: ['style-loader', 'css-loader?modules&importLoaders', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });

    return config;
  },
};
