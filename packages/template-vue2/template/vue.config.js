const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

let mainAddress = '' //'http://192.168.1.98:8090' // http://192.168.1.98:5555   家里：http://192.168.192.12:5555
module.exports = {
  outputDir:path.resolve(__dirname, 'tsu'),
  indexPath:path.resolve(__dirname, 'tsu/index.html'),
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'
    : '/',
  productionSourceMap: false,
  pwa: {
    iconPaths: {
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico'
    }
  },
  devServer: {
    port:8081,
    disableHostCheck: true,
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    name: ""
  },
  chainWebpack: (config)=>{
    config.resolve.alias
        .set('@', resolve('src'))
        .set('assets',resolve('src/assets'))
        .set('components',resolve('src/components'))
        .set('business', resolve('src/components/business'))
    return config
  }
}
