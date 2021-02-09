const shell = require('shelljs');
const fs = require("fs");
const path = require("path");
function exec(cmd) {
    try {
        const files = path.resolve(__dirname, '../dll/vendor-manifest.json')
        const flag = fs.existsSync(files)
        if (flag) {
            shell.exec(cmd)
        } else {
            if (shell.exec("npm run dll").code === 0) {
                shell.exec(cmd)
            }
        }

    } catch (e) {
        if (shell.exec("npm run dll").code === 0) {
            shell.exec(cmd)
        }
    }
}
module.exports=exec;
