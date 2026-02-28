import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const config: Config = {
  setupFiles: ['./jest-setup-file.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  coverageProvider: 'babel',
  collectCoverageFrom: ['libs/**/*.ts', 'apps/**/*.ts'],
  coveragePathIgnorePatterns: [
    'migrations/.+.ts',
    'apps/.*/src/config/.*\\.ts',
    'apps/.*/src/main.ts',
    'apps/mock-service-provider-fca-low/.+.ts',
    'apps/mock-identity-provider-fca-low/.+.ts',
    '.mocks/',
    '.+/index.ts',
    '.+.(config|descriptor|dto|enum|fixture|interface|module|plugin|schema|type|token).ts',
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: [compilerOptions.baseUrl],
  rootDir: '.',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.spec.json',
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/@proconnect-gouv/(?!(proconnect.identite|proconnect.api_entreprise)/)',
  ],
  coverageDirectory: './coverage',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  testEnvironment: 'node',
  roots: ['<rootDir>/apps/', '<rootDir>/libs/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  preset: 'ts-jest',
};

export default config;
