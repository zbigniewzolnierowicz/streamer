/**
 * @type {import("eslint").Linter.Config}
 */
var config = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'turbo', 'prettier'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
    },
    rules: {
        indent: [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        quotes: [
            "error",
            "double"
        ],
        semi: [
            "error",
            "always"
        ],
        "no-trailing-spaces": "error"
    }
}

module.exports = config;