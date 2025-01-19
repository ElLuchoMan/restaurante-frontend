module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/src/test.ts'
    ],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.spec.json',
            stringifyContentPathRegex: '\\.html$',
            astTransformers: [
                "jest-preset-angular/build/InlineFilesTransformer",
                "jest-preset-angular/build/StripStylesTransformer"
            ]
        }
    },
    coverageDirectory: '<rootDir>/coverage/',
    coverageReporters: ['html', 'lcov', 'text-summary']
};