/* eslint-env node */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],

  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      // Allow `require` in CommonJS files
      files: ['**/*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],

  ignorePatterns: [
    '!.storybook/',
    'build/',
    'coverage/',
    'coverage-local/',
    'dist/',
    'legacy-types/',
    'lib-dist/',
    'node_modules/',
    'storybook-static/',
    // Each demo app has its own eslint config, follows the conventions of its build system
    'demos/'
  ],
};
