'use strict';

const webpack = require("webpack")

module.exports = {
    context: __dirname + "/src",
    entry: {
        main: "./main.js",
        day2: "./day2.js",
        day1: "./day1.js",
    },
    output: {
        path: __dirname + "/dist",
        filename: "[name].bundle.js",
        publicPath: "/dist/",
    }
}
