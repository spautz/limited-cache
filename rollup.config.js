/* eslint-env node*/
/* eslint-disable @typescript-eslint/camelcase */

import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json';
const {
  exportNamesToPreserve,
  propertyNamesToPreserve,
  propertyNameMap,
} = require('./scripts/buildNameMangling');

const inputFiles = {
  main: './src/main.ts',
  hooks: './src/hooks.ts',
};
const outputDir = 'dist/';

const terserOptions = {
  compress: {
    pure_getters: true,
    unsafe: true,
    unsafe_comps: true,
    warnings: true,
  },
  module: true,
  toplevel: true,
  mangle: {
    module: true,
    toplevel: true,
    reserved: exportNamesToPreserve,
    properties: {
      reserved: [...exportNamesToPreserve, ...propertyNamesToPreserve],
    },
  },
  nameCache: {
    vars: {
      props: {},
    },
    props: {
      props: Object.keys(propertyNameMap).reduce((acc, propName) => {
        // Terser puts a '$' in front of each key
        acc[`$${propName}`] = propertyNameMap[propName];
        return acc;
      }, {}),
    },
  },
};

const makeRollupConfig = (options) => ({
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
  makeRollupConfig({
    input: inputFiles,
    output: {
      dir: outputDir,
      entryFileNames: 'limited-cache.[name].cjs.development.js',
      format: 'cjs',
    },
    plugins: [
      typescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
      }),
    ],
  }),

  // CommonJS, production
  makeRollupConfig({
    input: inputFiles,
    output: {
      dir: outputDir,
      entryFileNames: 'limited-cache.[name].cjs.production.min.js',
      format: 'cjs',
    },
    plugins: [
      typescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser(terserOptions),
    ],
  }),

  // ES
  makeRollupConfig({
    input: inputFiles,
    output: { dir: outputDir, entryFileNames: '[name].esm.js', format: 'esm' },
    plugins: [typescript()],
  }),

  // UMD, production, without hooks
  makeRollupConfig({
    input: inputFiles.main,
    output: {
      name: 'limitedCache',
      file: `${outputDir}limited-cache.main.umd.production.min.js`,
      format: 'umd',
    },
    plugins: [
      typescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
      }),
      terser(terserOptions),
    ],
  }),
];
