/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  preset: 'ts-jest',
  roots:['<rootDir>/src'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ["/node_modules/"],
  verbose: true,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  testTimeout: 120000
};