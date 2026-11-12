module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  extensionsToTreatAsEsm: ['.ts'],
  injectGlobals: true,
  setupFiles: ['<rootDir>/../test/setup-jest.ts'],
  cache: false,
  transform: {
    '^.+\\.(t|j)s$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          module: 'esnext',
          target: 'es2022',
        },
      },
    ],
  },
  moduleNameMapper: {
    '^(\\./.*)\\.js$': '$1',
    '^@nestjs/common$': '<rootDir>/../node_modules/@nestjs/common',
  },
  transformIgnorePatterns: [],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};