import eslintJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

const buildOutputs = [
  '.docusaurus',
  'build',
  'coverage',
  'dist',
  'node_modules',
  'storybook-static',
];
const projectDirectoriesToIgnore = `{${buildOutputs.join(',')}}/**`;

export default typescriptEslint.config(
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

  // Global settings
  {
    languageOptions: {
      parser: typescriptEslint.parser,
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },

  // Base configs for all files
  eslintJs.configs.recommended,
  importPlugin.flatConfigs.recommended,

  //CJS
  {
    files: ['**/*.{cjs,cts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // React
  {
    files: ['**/*.{jsx,tsx}'],
    extends: [jsxA11yPlugin.flatConfigs.recommended],
    languageOptions: {
      globals: {
        react: 'readonly',
      },
    },
    // We have to set things up manually for the react and react-hooks plugins to work in flat config
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },

  // Typescript
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    extends: [
      eslintJs.configs.recommended,
      // importPlugin.flatConfigs.typescript,
      typescriptEslint.configs.strict,
      typescriptEslint.configs.strictTypeChecked,
    ],
  },

  // Prettier always comes last
  eslintConfigPrettier,
);
