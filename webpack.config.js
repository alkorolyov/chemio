const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');
const WatchExternalFilesPlugin  = require('webpack-watch-files-plugin').default;

module.exports = (env, argv) => ({
    entry: {
        main: './src/index.js'
    },
    target: "web",
    devtool: false,
    output: {
        // path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: 'webpack-livereload.js',
    },
    devServer: {
        contentBase: './src', // searches in this folder for index.html automatically
        watchContentBase: true // recompile on changes of index.html
    },
    plugins: [
        new MergeIntoSingleFilePlugin({
            files: {
                'bundle.js': [
                    // instead of *.js
                    // files included explicitly to maintain load order

                    // core
                    'src/core/core.js',
                    'src/core/structures.js',
                    'src/core/shapes.js',
                    'src/core/styles.js',
                    'src/core/informatics.js',
                    'src/core/io.js',
                    'src/core/renderer.js',
                    'src/core/canvas.js',

                    // ui
                    'src/ui/ui.js',
                    'src/ui/depot.js',
                    'src/ui/actions.js',
                    'src/ui/managers/history.js',
                    'src/ui/states.js',
                    'src/ui/managers/state.js',
                    'src/ui/elements.js',
                    'src/ui/lasso.js',
                    'src/ui/managers/toolbar.js',
                    'src/ui/managers/copypaste.js',
                    'src/ui/sketchercanvas.js'
                ],
                'styles.css': [
                    'src/styles.css'
                ]
            },
            transform: argv.mode === 'production' ? {
                'bundle.js': code => require("uglify-es").minify(code).code
            } : {}
        }),
        new WatchExternalFilesPlugin( argv.mode === 'development' ? {
            files: [
                './src/**/*.js',
                'styles.css'
            ],
            verbose: true
        } : {})
    ]
})
