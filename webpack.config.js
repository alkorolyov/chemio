const path = require('path');

const PATHS = {
    src: path.join(__dirname,'src'),
    dist: path.join(__dirname,'dist'),
}

module.exports = {
    devtool: "eval-source-map",
    entry: {
        app: `${PATHS.src}/core.js`
    },
    output: {
        filename: `[name].js`,
        path: PATHS.dist,
        publicPath: PATHS.dist.split("\\").pop(), // get last folder from absolute path
        library: 'chemio',
        libraryTarget: 'global'
    },
    resolve: {
        extensions: ['.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                include: [PATHS.src]
            }]
    }
}
