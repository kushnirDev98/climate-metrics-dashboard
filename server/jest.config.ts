import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest/presets/js-with-ts-esm', // Use ts-jest with ESM support
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts$': ['ts-jest', {
            useESM: true, // ESM support
            tsconfig: 'tsconfig.json', // Reference tsconfig
        }],
    },
    transformIgnorePatterns: ['/node_modules/(?!moment)'], // Allow moment to be transformed
    moduleFileExtensions: ['ts', 'js', 'json'],
    testMatch: ['**/?(*.)+(spec|test).ts'],
    extensionsToTreatAsEsm: ['.ts'],
};

export default config;