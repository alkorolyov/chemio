const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const WatchExternalFilesPlugin  = require('webpack-watch-files-plugin').default;

module.exports = {
    entry: {
        main: './src/index.js'
    },
    target: "web",
    devtool: false,
    output: {
        // path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: 'main.js',
    },
    devServer: {
        contentBase: './src', // searches in this folder for index.html automatically
        watchContentBase: true
    },
    plugins: [
        new MergeIntoSingleFilePlugin({
            files: {
                'merge.js': [
                    'src/core.js',
                    'src/ui.js'
                ],
                'styles.css': [
                    'src/styles.css'
                ]
            }
        }),
        new WatchExternalFilesPlugin({
            files: [
                './src/**/*.js'
            ],
            verbose: true
        })
    ]
}
