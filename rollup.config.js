/* eslint-env node*/

import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json';
const { propertyNamesToPreserve, propertyNameMap } = require('./scripts/buildNameMangling');

const inputFiles = {
  index: './src/index.ts',
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
  mangle: {
    module: true,
    properties: {
      reserved: propertyNamesToPreserve,
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
    chunkFileNames: 'chunk-[name]-[hash].js',
    ...options.output,
  },
  external: [
    ...Object.keys(packageJson.dependencies || {}),
    ...Object.keys(packageJson.optionalDependencies || {}),
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
    preserveModules: true,
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
    input: inputFiles.index,
    output: {
      name: 'limitedCache',
      file: `${outputDir}limited-cache.index.umd.production.min.js`,
      format: 'umd',
      esModule: false,
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
