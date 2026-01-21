import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

// noinspection JSUnusedGlobalSymbols
export default [ {
        input: 'src/wica.js',
        output: {
            dir: 'dist/rel',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            // Invoke terser but just use the default options until
            // it is proved that we need something else.
            terser( {}),
        ]
    }, {
        input: 'src/client-api.js',
        output: {
            dir: 'dist/rel',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            resolve(),
            commonjs(),
            // Note: we don't use terser when building the client-api.js
        ]
    }
];