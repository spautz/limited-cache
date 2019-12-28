import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json';

const inputFiles = { index: './index.ts', hooks: './hooks.ts' };
const noDeclarationFiles = { compilerOptions: { declaration: false } };

export default [
  // CommonJS
  {
    input: inputFiles,
    output: { dir: 'dist-cjs/', format: 'cjs', indent: false },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [typescript({ useTsconfigDeclarationDir: true })],
  },

  // ES
  {
    input: inputFiles,
    output: { dir: 'dist-es/', format: 'es', indent: false },
    external: [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.peerDependencies || {}),
    ],
    plugins: [typescript({ tsconfigOverride: noDeclarationFiles })],
  },
];
