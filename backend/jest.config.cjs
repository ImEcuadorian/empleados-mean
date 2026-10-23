module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    clearMocks: true,
    watchman: false,
    testMatch: ['**/?(*.)+(spec|test).ts']
};
