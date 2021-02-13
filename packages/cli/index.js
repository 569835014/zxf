
const rootCheck = require('root-check')
const log = require('@zxfc/log')
const exec = require('@zxfc/exec')
const colors = require('colors')
const userHome = require('user-home')
const dotenv = require('dotenv')
const pathExists = require('path-exists').sync
const { DEFAULT_CLI_HOME } = require('./lib/const')
const path = require('path')
const commander = require( 'commander' )
const program = new commander.Command()
const pkg = require('./package.json')
/**
 * 前置校验
 */
async function prepareCheck() {
    log.notice('启动阶段','检查环境中...')
    try {
        checkRoot();
        checkUserHome();
        checkEnv()
    }catch (e) {
        log.error('启动失败',e.message)
    }

}

/**
 * 检查用户主目录存不存在
 */
function checkUserHome(){
    if (!userHome || !pathExists( userHome )) {
        throw new Error( colors.red( '当前登录用户主目录不存在！' ) )
    }
}

function checkRoot() {
    rootCheck()
}
function checkEnv () {
    const envPath = path.resolve( userHome, '.env' )
    if (pathExists( envPath )) {
        dotenv.config( {
            path: envPath
        });
    }
    createDefaultConfig();
}
function createDefaultConfig() {
    const cliConfig = {
        home: userHome
    }
    if (process.env.CLI_HOME) {
        cliConfig.cliHome = path.join( userHome, process.env.CLI_HOME )
    } else {
        cliConfig.cliHome = path.join( userHome, DEFAULT_CLI_HOME )
    }
    process.env.CLI_HOME_PATH = cliConfig.cliHome;
    return cliConfig
}
function registerCommand() {
    program
        .name( Object.keys( pkg.bin )[ 0 ] )
        .usage( '<command> [options]' )
        .version( pkg.version )
        .option( '-d, --debug', '是否开启调试模式', false )
        .option( '-tp, --targetPath <targetPath>', '是否制定本地调试文件路径', '' )
    program
        .command( 'init [projectName]' )
        .option( '-f, --force', '是否强制初始化项目' )
        .action( exec )
    program.on( 'option:debug', function () {
        if (program.debug === true) {
            process.env.LOG_LEVEL = 'verbose'
        } else if(program.debug === false){
            process.env.LOG_LEVEL = 'info'
        } else {
            process.env.LOG_LEVEL = 'verbose'
        }
        log.level = process.env.LOG_LEVEL
    } )
    program.on( 'option:targetPath', function (targetPath) {
        if (targetPath || program.targetPath) {
            process.env.CLI_TARGET_PATH = targetPath || program.targetPath
        }
    } )
    program.on( 'command:*', function (obj) {
        const availableCommands = program.commands.map( cmd => cmd.name() );
        console.log( colors.red( '未知的命令(command): ' + obj[ 0 ] ) )
        if (availableCommands > 0) {
            console.log( colors.green( '可以命令:' + availableCommands.join( ',' ) ) )
        }
    } )
    program.parse( process.argv )
    if (program.args && program.args.length < 1) {
        program.outputHelp();
    }
    log.info('注册命令成功','success')
}
async function core() {
    await prepareCheck();
    try {
        log.notice('注册命令','注册命令中...')
        registerCommand()
    }catch (e) {
        log.error('注册命令失败', e.message )
        if (process.env.LOG_LEVEL === 'verbose') {
            console.error( e );
        }
    }
}
module.exports = core