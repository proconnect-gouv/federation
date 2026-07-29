import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

const config: Config = {
  setupFiles: ["./jest-setup-file.ts"],
  setupFilesAfterEnv: ["jest-extended/all"],
  coverageProvider: "babel",
  collectCoverageFrom: ["src/**/*.ts", "libs/**/*.ts"],
  coveragePathIgnorePatterns: [
    "src/config/.*\\.ts",
    "src/main.ts",
    ".mocks/",
    ".+/index.ts",
    ".+.(config|descriptor|dto|enum|fixture|interface|module|plugin|schema|type|token).ts",
  ],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  moduleFileExtensions: ["js", "json", "ts"],
  modulePaths: [compilerOptions.baseUrl],
  rootDir: ".",
  testRegex: ".spec.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.spec.json",
        diagnostics: { ignoreCodes: [151002] },
      },
    ],
  },
  coverageDirectory: "./coverage",
  testEnvironment: "node",
  roots: ["<rootDir>/src/"],
  moduleNameMapper: pathsToModuleNameMapper(
    Object.fromEntries(
      Object.entries(compilerOptions.paths).filter(([key]) => key !== "*"),
    ),
    { prefix: "<rootDir>/" },
  ),
  preset: "ts-jest",
};

export default config;
