import { terser } from 'rollup-plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from "rollup-plugin-copy";

export default [ {
        input: 'src/wica.js',
        output: {
            dir: 'dist/rel',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            copy({
                targets: [
                    {src: "src/about.html", dest: "dist/rel" },
                    {src: "src/wica.css", dest: "dist/rel" },
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
            // Note: we don't use terser when building the client-api.js
        ]
    }
];