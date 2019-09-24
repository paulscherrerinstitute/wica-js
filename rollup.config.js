// import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import multiEntry from "rollup-plugin-multi-entry";

export default {
    input: ['src/wica.js', 'src/wica.css' ],
    output: {
        file: 'dist/rel/wica.min.js',
        format: 'esm',
        beautify: true,
        sourceMap: 'inline'
    },
    plugins: [
        multiEntry(),
        postcss({
            modules: true,
            extract: true,
            extensions: [ '.css' ],
        }),
        // terser( {
        //     mangle: {},
        //     compress: {},
        //     module: true,
        //     output: {
        //         comments: "all"
        //     }
        // } ),
    ]
};