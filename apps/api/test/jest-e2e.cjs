const base = require('../jest.config.cjs');

module.exports = {
  ...base,
  rootDir: '../src',
  testRegex: '.*\\.integration\\.spec\\.ts$',
};
