const path = require('path');
module.exports= {
    projectPath: path.resolve(__dirname, ".."),
    staticPath: path.resolve(__dirname, "../static"),
    workPath: path.resolve(__dirname, "../src"),
    assetsPath: path.resolve(__dirname, "../src/assets"),
    distPath: path.resolve(__dirname, "../dist")
}
