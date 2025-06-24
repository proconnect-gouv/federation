import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';

import { compilerOptions } from './tsconfig.json';

const config: Config = {
  setupFiles: ['./jest-setup-file.ts'],
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverageFrom: ['libs/**/*.ts', 'apps/**/*.ts', 'instances/**/*.ts'],
  coveragePathIgnorePatterns: [
    'instances/.+/src/config/.+.ts',
    'instances/.+/src/main.ts',
    'instances/mock-service-provider-fca-low/.+.ts',
    'instances/mock-identity-provider-fca-low/.+.ts',
    '.mocks/',
    '.+/index.ts',
    '.+.(config|descriptor|dto|enum|fixture|interface|module|plugin|schema|type|token).ts',
    'oidc-provider-base-runtime.exception.ts',
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
  modulePaths: [compilerOptions.baseUrl],
  rootDir: '.',
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
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
  roots: ['<rootDir>/apps/', '<rootDir>/libs/', '<rootDir>/instances/'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  preset: 'ts-jest',
};

export default config;
