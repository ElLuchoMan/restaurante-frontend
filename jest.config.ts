module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/', '<rootDir>/src/test.ts'],
  coverageDirectory: '<rootDir>/coverage/',
  coverageReporters: ['html', 'lcov', 'text-summary'],
};
