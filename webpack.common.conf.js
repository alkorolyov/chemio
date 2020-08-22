const path = require('path');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');

const PATHS = {
    src: path.join(__dirname,'./src'),
    dist: path.join(__dirname,'./dist'),
}
module.exports = {
    externals: {
        paths: PATHS
    },

    entry: {
        app: `${PATHS.src}/core.js`
    },
    output: {
        filename: `[name].js`,
        path: PATHS.dist,
        publicPath: '/'
    },
    plugins: [
        // new LiveReloadPlugin(),
        new MergeIntoSingleFilePlugin({
            files: {
                'app.js': [
                    `${PATHS.src}/core.js`,
                    `${PATHS.src}/ui.js`
                ],
                'app.css': [
                    './install/ui.css'
                ]
            }
        })

    ]
}
