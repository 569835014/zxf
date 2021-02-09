const baseConfig = require('./webpack.base.conf');
const merge = require('webpack-merge')
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin')
const config = require('./config')
const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');//压缩css插件
const purifycssWebpack = require('purifycss-webpack');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const glob = require('glob');
const TerserPlugin= require('terser-webpack-plugin')
module.exports = merge(
    {
        mode: "production",
        optimization:{
            minimize:true,
            splitChunks: {
                cacheGroups: {
                    // vendor:{//node_modules内的依赖库
                    //     chunks:"all",
                    //     test: /[\\/]node_modules[\\/]/,
                    //     name:"vendor",
                    //     minChunks: 1, //被不同entry引用次数(import),1次的话没必要提取
                    //     maxInitialRequests: 5,
                    //     minSize: 0,
                    //     priority:100,
                    //     // enforce: true?
                    // },
                    common: {// ‘src/js’ 下的js文件
                        chunks:"all",
                        test:/[\\/]src[\\/]js[\\/]/,//也可以值文件/[\\/]src[\\/]js[\\/].*\.js/,
                        name: "common", //生成文件名，依据output规则
                        minChunks: 2,
                        maxInitialRequests: 5,
                        minSize: 0,
                        priority:1
                    }
                }
            },
            minimizer: [
                new TerserPlugin({
                    parallel:true,
                    cache: true,
                    sourceMap: true, // Must be set to true if using source-maps in production
                    terserOptions: {
                        compress: {
                            drop_console: true,
                            drop_debugger: true,
                        },
                    },
                }),
            ],
        },
        plugins: [
            new ImageminPlugin({
                disable: false,

                pngquant: {//图片质量
                    quality: '80-100'
                }
            }),
            new CleanWebpackPlugin(),
            new OptimizeCssAssetsPlugin(),
            new MiniCssExtractPlugin({
                filename:'./css/[name][chunkhash:6].css'
            }),
            new CopyWebpackPlugin([
                {
                    from: './static',
                    to: './static',
                    ignore: ['.*']
                },
                {
                    from: './dll',
                    to: './dll',
                }
            ]),
            new webpack.DefinePlugin({
                'process.env.NODE_ENV':JSON.stringify(process.env.NODE_ENV),
                'WEBPACK_MODE':JSON.stringify('production')
            }),
            // css tree shaking
            new purifycssWebpack({
                paths: glob.sync(path.resolve('./src/*.html'))
            }),
        ],
        output: {
            path: path.resolve(config.projectPath, 'dist'),
            filename: "[name][chunkhash:6].js",
        },

    }, baseConfig
)
