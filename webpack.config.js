'use strict';

const webpack = require("webpack")

module.exports = {
    context: __dirname + "/src",
    entry: {
        main: "./main.js"
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js",
        publicPath: "/dist/",
    }
}