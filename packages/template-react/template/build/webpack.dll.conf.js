const path = require('path')
const webpack = require('webpack')
const config = require('./config')
module.exports = {
    entry: {
        vendor: ['react','react-dom']
    },
    output: {
        path: path.join(config.projectPath, './dll'),
        filename: 'dll.[name].js',
        library: '[name]'
    },
    plugins: [
        new webpack.DllPlugin({
            path: path.join(config.projectPath, './dll','[name]-manifest.json'),
            name: '[name]'
        })
    ]
}
