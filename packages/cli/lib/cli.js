#!/usr/bin/env node
'use strict';
const importLocal = require('import-local')
const log = require('@zxfc/log')
if(importLocal(__filename)) {
    log.notice('启动阶段','正在加载本地的cli')
} else {
    log.verbose('启动阶段','正在加载全局的cli')
    require('../index')();

}
