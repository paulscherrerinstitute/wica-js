// import { terser } from 'rollup-plugin-terser';

export default {
    input: 'src/wica.js',
    output: {
        file: 'dist/rel/wica.min.js',
        format: 'esm',
        beautify: true,
        sourceMap: 'inline'
    },
    plugins: [
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