const path = require('path');
const config = require('./config')
const htmlWebpackPlugin = require('../plugins/html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HappyPack =require('happypack')
const os = require('os');
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length });
const webpack =require('webpack')
const manifest = require('../dll/vendor-manifest.json')
function styleLoader() {
    if (process.env.NODE_ENV === 'dev') {
        return 'style-loader'
    }
    return MiniCssExtractPlugin.loader
}

const filePath = process.env.NODE_ENV === 'dev' ? './' : '../'
module.exports = {
    entry: {
        main: path.resolve(config.workPath, 'main.js'),
    },
    resolve: {
        extensions: [".js", ".jsx", ".styl", ".css", "json"],
        alias: {
            "@": config.workPath,
            "static": config.staticPath,
            "assets": config.assetsPath,
            "CDN":'www.baidu.com'
        },
    },
    output: {
        path: path.resolve(config.projectPath, 'dist'),
        filename: "./[name][hash:6].js",
        chunkFilename: "[name][hash:6].min.js",
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                include:[path.resolve(config.workPath)],
                // use:{
                //     loader: 'babel-loader',
                // },
                use: {
                    loader: 'happypack/loader?id=happyBabel',
                }
            },
            {
                test: /\.(styl|stylus)$/,
                include: config.workPath,
                exclude: /node_modules/,
                use: [
                    styleLoader(),
                    'css-loader',
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require('autoprefixer')
                            ]
                        }
                    },
                    'stylus-loader',

                ]
            },
            {
                test: /\.css$/,
                include: config.workPath,
                exclude: /node_modules/,
                use: [
                    styleLoader(),
                    'css-loader',
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [
                                require('autoprefixer')
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'img/[name].[hash:6].[ext]',
                    publicPath: filePath
                }
            },
            {
                test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'media/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                options: {
                    limit: 10000,
                    name: 'fonts/[name].[hash:7].[ext]',
                }
            }
        ]
    },
    plugins: [
        new HappyPack(
            {
                id:'happyBabel',
                loaders:[
                    {
                        loader: 'babel-loader?cacheDirectory=true',
                    }
                ],
                threadPool:happyThreadPool,
                verbose:true
            }
        ),
        new webpack.ProvidePlugin({
            React: 'react',
            ReactDOM: 'react-dom',
            Component: ['react','Component'] // 导出react模块中的Component
        }),
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            title: "max",
            NODE_DEV:process.env.NODE_ENV,
        }),
        new webpack.DllReferencePlugin({
            manifest
        })
    ]
}
