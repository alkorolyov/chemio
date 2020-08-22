const path = require("path")
const webpack = require('webpack')
const HtmlWebPackPlugin = require("html-webpack-plugin")
const TerserPlugin = require('terser-webpack-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');

module.exports = {
    entry: {
        main: './src/app.js'
    },
    target: "web",
    devtool: false,
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: '[name].js',
        library: 'Chemio',
        libraryTarget: "global"
    },
    module: {
        rules: [
            {
                // Loads the javacript into html template provided.
                // Entry point is set below in HtmlWebPackPlugin in Plugins
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        //options: { minimize: true }
                    }
                ]
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            inject: false,
            template: "./src/index.html",
            filename: "./index.html"
        }),
        new MergeIntoSingleFilePlugin({
            files: {
                'main.js': [
                    '.src/app.js'
                ]
            }
        })
    ]
}
