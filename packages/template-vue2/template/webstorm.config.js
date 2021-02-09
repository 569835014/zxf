const resolve = dir => require('path').join(__dirname, dir);

module.exports = {
    resolve: {
        alias: {
            '@': resolve('src'),
            'assets': resolve('src/assets'),
            'components': resolve('src/components'),
            'business': resolve('src/components/business'),
        }
    }
};
