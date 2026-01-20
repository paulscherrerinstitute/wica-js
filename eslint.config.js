import globals from "globals";
import pluginJs from "@eslint/js";

export default [
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                // Note: the following is required to fix a linter error process not defined when parsing
                // rollup.xxx/config.js file
                // See SO: https://stackoverflow.com/questions/50894000/eslint-process-is-not-defined
                process: true
            }
        },
    },
    pluginJs.configs.recommended,
];

