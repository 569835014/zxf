'use strict';
const semver = require( 'semver' )
const colors = require( 'colors/safe' )
const LOWEST_NODE_VERSION = '12.0.0'
const log = require( '@zxfc/log' )

class Command {
    constructor (argv) {
        log.verbose( 'init Command:', argv )
        if (!argv) {
            throw new Error( '参数不能为空！' )
        }
        if (!Array.isArray( argv )) {
            throw new Error( '参数必须为数组' )
        }
        if (argv.length < 1) {
            throw new Error( '参数数组不能为空' )
        }

        this._argv = argv
        let runner = new Promise( (resolve, reject) => {
            let chain = Promise.resolve();
            chain = chain.then( () => this.checkNodeVersion() );
            chain = chain.then( () => this.initArgs() );
            chain = chain.then(()=> this.init())
            chain.catch( error => {
                log.error( error.message )
            } )
        } )
    }

    init () {
        throw new Error( 'init必须实现' )
    }

    exec () {
        throw new Error( 'exec必须实现' )
    }

    initArgs () {
        this._cmd = this._argv[ this._argv.length - 1 ]
        this._argv = this._argv.slice( 0, this._argv.length - 1 );
    }

    checkNodeVersion () {
        const nodeVersion = process.version;
        if (!semver.gte( nodeVersion, LOWEST_NODE_VERSION )) {
            throw new Error( colors.red( `需要安装v${ LOWEST_NODE_VERSION }版本的Node.js,当前${ colors.green( nodeVersion ) }` ) )
        }
    }
}

module.exports = Command;