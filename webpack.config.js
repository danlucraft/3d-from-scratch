'use strict';

const webpack = require("webpack")

module.exports = {
    context: __dirname + "/src",

    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            { test: /\.tsx?$/, loader: "ts-loader" }
        ]
    },

    entry: {
        main: "./main.js",
        day3: "./day3.ts",
        day2: "./day2.js",
        day1: "./day1.js",
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js",
        publicPath: "/dist/",
    }
}