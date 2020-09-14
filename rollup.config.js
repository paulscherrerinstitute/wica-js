import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from "rollup-plugin-copy-assets";

export default [ {
        input: 'src/wica.js',
        output: {
            dir: 'dist/rel',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            copy({
                assets: [
                    "src/about.html",
                    "src/wica.css",
                ],
            }),
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
            // Invoke terser but just use the default options until
            // it is proved that we need something else.
            terser({}),
        ]
    }
];