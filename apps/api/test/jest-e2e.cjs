const base = require('../jest.config.cjs');

module.exports = {
  ...base,
  rootDir: '..',
  testRegex: '.*\\.integration\\.spec\\.ts$',
};
