'use strict';
const toString = Object.prototype.toString;
const childProcess = require('child_process');

function isObject( o ) {
    return toString.call(o) === '[object Object]';
}

function spinnerStart( msg, spinnerString = '|/-\\' ) {
    const Spinner = require('cli-spinner').Spinner;
    const spinner = new Spinner(`${msg} %s`);
    spinner.setSpinnerString(spinnerString);
    spinner.start(true);
    return spinner;
}

async function sleep( wait = 1000 ) {
    await new Promise(resolve => setTimeout(resolve, wait));
}

function exec( command, args, options ) {
    const win32 = process.platform === 'win32';
    const cmd = win32? 'cmd' : command;
    const cmdArgs = win32? ['/c'].concat(command, args) : args;
    return childProcess.spawn(cmd, cmdArgs, options || {});
}
function execAsync( command, args, options ) {
    return new Promise(( resolve, reject ) => {
        const p = exec(command, args, options);
        p.on('error', e => {
            reject(e);
        });
        p.on('exit', c => {
            resolve(c);
        });
    });
}
module.exports = {
    isObject,
    spinnerStart,
    sleep,
    exec,
    execAsync
};
