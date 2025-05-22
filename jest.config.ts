// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'js', 'json'],
	testMatch: ['**/*.spec.ts'],
	setupFiles: ['<rootDir>/src/test/jest.setup.ts'],
};

export default config;
