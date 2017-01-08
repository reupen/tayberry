const path = require('path');

const {CheckerPlugin} = require('awesome-typescript-loader');

module.exports = {
    resolve: {
        modules: [
            path.resolve(__dirname, 'src'),
            'node_modules'
        ],
        extensions: ['.ts', '.js']
    },
    entry: 'tayberry',
    output: {
        path: './dist',
        filename: 'tayberry.js'
    },
    devtool: 'source-map',
    module: {
        loaders: [{
            test: /\.ts$/,
            loader: 'awesome-typescript-loader'
        }]
    },
    plugins: [
        new CheckerPlugin()
    ]
};