import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/main/app.ts",
    "!src/main/bootstrap.ts",
    "!src/main/server.ts",
  ],
  coverageDirectory: "coverage",
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: ".",
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  //   setupFilesAfterEnv: ["<rootDir>/test/jest-setup.ts"],
};

export default config;
