import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json';

const inputFiles = { index: './src/index.ts', hooks: './src/hooks.ts' };
const noDeclarationFiles = { compilerOptions: { declaration: false } };

export default [
  // CommonJS
  {
    input: inputFiles,
    output: { dir: 'build/cjs/', format: 'cjs', indent: false },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [typescript({ useTsconfigDeclarationDir: true })],
  },

  // ES
  {
    input: inputFiles,
    output: { dir: 'build/', format: 'es', indent: false },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [typescript({ tsconfigOverride: noDeclarationFiles })],
  },
];
