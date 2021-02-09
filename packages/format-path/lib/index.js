'use strict';

const path = require('path')
function formatPath(p) {
    if(p && typeof p === 'string') {
        // path.sep 分隔符
        const sep = path.sep;
        if(sep === '/') return p;
        // 对window路径进行转换
        return p.replace(/\\/g,'/')
    }
    return p
}
module.exports = formatPath;