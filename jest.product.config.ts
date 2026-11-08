import config from "./jest.config";

export default {
  ...config,
  coverageProvider: "babel",
  testMatch: ["<rootDir>/src/usecase/product/**/*.spec.ts"],
  collectCoverageFrom: ["src/usecase/product/**/*.usecase.ts"],
  coverageDirectory: "coverage/product",
  coverageReporters: ["text", "lcov", "json-summary"],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
