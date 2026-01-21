const base = require('./jest.base.config');

/** @type {import('jest').Config} */
module.exports = {
  ...base,
  testMatch: ['**/*.spec.ts', '**/*.int-spec.ts', '**/*.e2e-spec.ts'],
};

