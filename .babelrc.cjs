module.exports = {
    "plugins": [
        ["@babel/plugin-transform-modules-commonjs"],
        ["babel-plugin-transform-import-meta"],
        ["importAttributes"],
        ["importAssertions"],
        [ "search-and-replace", {
            "rules": [
                {
                  "search": /\.mjs/,
                  "replace": ".cjs"
                },
                {
                  "search": /\.\/src\//,
                  "replace": "./dist/"
                }
            ]
        }]
    ]
}