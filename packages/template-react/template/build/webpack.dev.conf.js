const baseConfig = require('./webpack.base.conf');
const merge = require('webpack-merge')
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const config = require('./config')
const path = require('path')

module.exports = merge(
    {
        mode: "development",
        devServer: {
            open: true,
            hot: true,
            port: "9000",
            host: "localhost",
            hotOnly: true
        },
        plugins: [
            new webpack.HotModuleReplacementPlugin(),
            new CopyWebpackPlugin([
                {
                    from: config.staticPath,
                    to: path.resolve(config.projectPath, 'static'),
                    ignore: ['.*']
                }
            ]),

            new webpack.DefinePlugin({
                'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV),
                'WEBPACK_MODE':JSON.stringify('development')
            })
        ]
    }, baseConfig
)
