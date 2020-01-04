/* eslint-disable @typescript-eslint/camelcase */

import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json';

const inputFiles = { main: './src/main.ts', hooks: './src/hooks.ts' };
const outputDir = 'dist/';
const terserOptions = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    warnings: false,
  },
};

const makeConfig = (options) => ({
  ...options,
  output: {
    sourcemap: true,
    ...options.output,
  },
  external: [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.peerDependencies || {}),
  ],
  treeshake: {
    propertyReadSideEffects: false,
  },
});

export default [
  // CommonJS, development
  makeConfig({
    input: inputFiles,
    output: {
      dir: outputDir,
      entryFileNames: 'limited-cache.[name].cjs.development.js',
      format: 'cjs',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': 'development',
      }),
      typescript(),
    ],
  }),

  // CommonJS, production
  makeConfig({
    input: inputFiles,
    output: {
      dir: outputDir,
      entryFileNames: 'limited-cache.[name].cjs.production.min.js',
      format: 'cjs',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': 'production',
      }),
      typescript(),
      terser(terserOptions),
    ],
  }),

  // ES
  makeConfig({
    input: inputFiles,
    output: { dir: outputDir, entryFileNames: '[name].esm.js', format: 'esm' },
    plugins: [typescript()],
  }),

  // UMD, production, without hooks
  makeConfig({
    input: inputFiles.main,
    output: {
      name: 'limited-cache',
      file: `${outputDir}limited-cache.main.umd.production.min.js`,
      format: 'umd',
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': 'production',
      }),
      typescript(),
      terser(terserOptions),
    ],
  }),
];
