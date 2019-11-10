import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';

import packageJson from './package.json'

const noDeclarationFiles = { compilerOptions: { declaration: false } };

export default [
    // CommonJS
    {
        input: 'src/index.ts',
        output: { file: 'dist-cjs/limited-cache.js', format: 'cjs', indent: false },
        external: [
            ...Object.keys(packageJson.dependencies || {}),
            ...Object.keys(packageJson.peerDependencies || {}),
        ],
        plugins: [
            // nodeResolve({
            //     extensions: ['.ts']
            // }),
            typescript({ useTsconfigDeclarationDir: true }),
            // babel()
        ],
    },

    // ES
    {
        input: 'src/index.ts',
        output: { file: 'dist-es/limited-cache.js', format: 'es', indent: false },
        external: [
            ...Object.keys(packageJson.dependencies || {}),
            ...Object.keys(packageJson.peerDependencies || {}),
        ],
        plugins: [
            // nodeResolve({
            //     extensions: ['.ts']
            // }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            // babel()
        ],
    },

    // ES for Browsers
    {
        input: 'src/index.ts',
        output: { file: 'dist-es/limited-cache.mjs', format: 'es', indent: false },
        plugins: [
            // nodeResolve({
            //     extensions: ['.ts']
            // }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            // babel({
            //     exclude: 'node_modules/**'
            // }),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true,
                    warnings: false,
                },
            }),
        ],
    },

    // UMD Development
    {
        input: 'src/index.ts',
        output: {
            file: 'dist-umd/limited-cache.js',
            format: 'umd',
            name: 'LimitedCache',
            indent: false,
        },
        plugins: [
            // nodeResolve({
            //     extensions: ['.ts']
            // }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            // babel({
            //     exclude: 'node_modules/**'
            // }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('development'),
            }),
        ],
    },

    // UMD Production
    {
        input: 'src/index.ts',
        output: {
            file: 'dist-umd/limited-cache.min.js',
            format: 'umd',
            name: 'LimitedCache',
            indent: false,
        },
        plugins: [
            // nodeResolve({
            //     extensions: ['.ts']
            // }),
            typescript({ tsconfigOverride: noDeclarationFiles }),
            // babel({
            //     exclude: 'node_modules/**'
            // }),
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
            terser({
                compress: {
                    pure_getters: true,
                    unsafe: true,
                    unsafe_comps: true,
                    warnings: false,
                },
            }),
        ],
    },
];
