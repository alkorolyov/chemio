const path = require('path');
const {merge} = require('webpack-merge');
const webpack = require('webpack');
const commonWebpackConfig = require('./webpack.common.conf');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devWebackConfig = merge(commonWebpackConfig, {
    mode: 'development',

    devtool: 'cheap-module-eval-source-map',
    devServer: {
        port: 8081,
        contentBase: path.resolve(__dirname, "./src"),
        publicPath: '/public/',
        watchContentBase: true,
        inline: true
        // hot: true
    }
})

module.exports = new Promise((resolve, reject) => {
    resolve(devWebackConfig)
})
