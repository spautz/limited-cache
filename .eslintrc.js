/* eslint-env node */

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },

  rules: {},
  overrides: [
    {
      files: ['*.{js,ts}'],
      rules: {
        '@typescript-eslint/ban-ts-comment': [
          'on',
          { 'ts-expect-error': 'allow-with-description' },
        ],
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
