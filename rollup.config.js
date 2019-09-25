import { terser } from 'rollup-plugin-terser';
import copy from "rollup-plugin-copy-assets";

export default {
    input: 'src/wica.js',
    output: {
        file: 'dist/rel/wica.js',
        format: 'esm',
        beautify: true,
        sourcemap: true,
    },
    plugins: [
        copy({
            assets: [
                "src/about.html",
                "src/test.html",
                "src/wica.css",
            ],
        }),
        // Invoke terser but just use the default options until
        // it is proved that we need something else.
        terser(),
    ]
};