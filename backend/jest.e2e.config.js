const base = require('./jest.base.config');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  testMatch: ['**/*.e2e-spec.ts'],
};

