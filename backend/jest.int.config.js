const base = require('./jest.base.config');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  testMatch: ['**/*.int-spec.ts'],
};

