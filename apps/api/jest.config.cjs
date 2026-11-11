module.exports = {
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['js', 'json', 'ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { ...require('./tsconfig.json').compilerOptions, module: 'CommonJS', moduleResolution: 'Node' } },
    ],
  },
  testEnvironment: 'node',
};
