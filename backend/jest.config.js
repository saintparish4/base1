module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testMatch: ['**/dist/tests/**/*.test.js'],
    collectCoverageFrom: [
        '**/dist/**/*.js',
        '!**/node_modules/**',
        '!**/tests/**',
        '!**/coverage/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testTimeout: 30000,
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/dist/tests/setup.js'],
    testPathIgnorePatterns: ['/node_modules/', '/tests/', '/src/', '**/*.ts'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/dist/src/$1',
        '^@/(.*)$': '<rootDir>/dist/$1'
    }
}