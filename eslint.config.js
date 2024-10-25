import { fixupPluginRules } from '@eslint/compat';
import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintConfigReactApp from 'eslint-config-react-app';
import eslintPluginFlowtype from 'eslint-plugin-flowtype';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import typescriptEslint from 'typescript-eslint';

const buildOutputs = [
  '.docusaurus',
  'build',
  'coverage',
  'dist',
  'legacy-types',
  'node_modules',
  'storybook-static',
];
const projectDirectoriesToIgnore = `{${buildOutputs.join(',')}}/**`;

const eslintConfig = [
  {
    ignores: [
      projectDirectoriesToIgnore,
      `demos/*/${projectDirectoriesToIgnore}`,
      `docs-website/${projectDirectoriesToIgnore}`,
      `packages/*/${projectDirectoriesToIgnore}`,
      // Each external-test has its own eslint config, following the conventions of its framework, so they're not included
      'external-tests/*/**',
    ],
  },
  {
    plugins: {
      // These plugins are all needed for eslint-config-react-app
      flowtype: fixupPluginRules(eslintPluginFlowtype),
      'jsx-a11y': eslintPluginJsxA11y,
      import: fixupPluginRules(eslintPluginImport),
      'react-hooks': eslintPluginReactHooks,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  eslintJs.configs.recommended,
  eslintConfigPrettier,
  reactRecommended,
  ...typescriptEslint.configs.recommended,

  // Overrides:
  {
    files: ['**/*.{js,ts,jsx,tsx,cjs,mjs}'],
    rules: {
      ...eslintConfigReactApp.rules,
      ...eslintConfigReactApp.overrides[0].rules,
      'react/react-in-jsx-scope': 'off',
    },
  },
];

export default eslintConfig;
