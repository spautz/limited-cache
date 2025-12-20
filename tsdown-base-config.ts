import { defineConfig } from 'tsdown';
import type { UserConfig } from 'tsdown';

const entryDefaults: Partial<UserConfig> = {
  entry: ['src/index.ts'],
  dts: true,
};

const baseConfigValues: Array<UserConfig> = [
  {
    ...entryDefaults,
    format: 'esm',
    outDir: './dist/esm',
    tsconfig: './tsconfig.build-esm.json',
    // ESM gets .js extensions instead of .mjs
    fixedExtension: false,
  },
  {
    ...entryDefaults,
    format: 'cjs',
    outDir: './dist/cjs',
    tsconfig: './tsconfig.build-cjs.json',
  },
];

const baseConfig: Array<UserConfig> = defineConfig(baseConfigValues);

export { baseConfig, baseConfigValues, entryDefaults };
