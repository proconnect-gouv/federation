module.exports = function(config) {
  config.set({
    mutator: 'typescript',
    packageManager: 'yarn',
    reporters: ['clear-text', 'progress'],
    testRunner: 'jest',
    transpilers: [],
    coverageAnalysis: 'off',
    tsconfigFile: 'tsconfig.build.json',
    mutate: [
      'libs/**/*.{ts,tsx}',
      '!libs/**/*.spec.{ts,tsx}',
      '!libs/**/*.module.ts',
      '!libs/examples/**/*',
      '!libs/**/testing/**/*',
    ],
    files: [
      'jest.config.js',
      'libs/**/*.tsx',
      'libs/**/*.ts',
      'libs/**/*.json',
      'package.json',
      'tsconfig.json',
    ],
  });
};
