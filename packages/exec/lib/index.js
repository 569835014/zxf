'use strict';

const Package = require( '@zxfc/package' )
const { exec: spawn } = require('@zxfc/tool')
const log = require( '@zxfc/log' )
const path = require( 'path' );
const prefix = '@zxfc'
// 所有commander的配置列表
const PACKAGE_MAP = {
   init: `${ prefix }/init`
}
const CACHE_DIR = 'dependencies/'
let pkg

async function index(_,_name, _cmdObj) {
   // 这里对参数进行重载
   let name;
   let cmdObj
   if(_) {
      name = _;
      cmdObj = _name.name ? _name : _cmdObj
   } else {
      name = _name;
      cmdObj= _cmdObj
   }
   // 先从环境变量中取出targetPath，这里可以通过命令指定本地commander命令
   let targetPath = process.env.CLI_TARGET_PATH
   const homePath = process.env.CLI_HOME_PATH
   let storeDir = '';
   log.verbose( 'targetPath', targetPath )
   log.verbose( 'homePath', homePath )
   const cmdName = cmdObj.name();
   const packageName = PACKAGE_MAP[ cmdName ];
   const packageVersion = 'latest';

   if (!targetPath) {
      targetPath = path.resolve( homePath, CACHE_DIR );
      storeDir = path.resolve( targetPath, 'node_modules' );
      log.verbose( 'targetPath', targetPath )
      log.verbose( 'storeDir', storeDir )
      pkg = new Package( {
         targetPath,
         storeDir,
         packageName,
         packageVersion
      } );
      if (await pkg.exists()) {
         // 更新package
         await pkg.update();
      } else {
         // 安装package
         await pkg.install();
      }
   } else {

      pkg = new Package( {
         targetPath,
         packageName,
         packageVersion
      } );
   }

   const rootFile = pkg.getRootFilePath();
   log.verbose('rootFile', rootFile)
   if (rootFile) {
      try {
         const argv = Array.from( arguments )
         const cmd = argv[ argv.length - 1 ]
         const o = Object.create( null );
         Object.keys( cmd ).forEach( (key) => {
            const value = cmd[ key ]
            if (cmd.hasOwnProperty( key ) && !key.startsWith( '_' ) && key !== 'parent' && value) {
               o[ key ] =  value
            }
         } )
         argv[ argv.length - 1 ] = o;
         const code = `require('${ rootFile }').call( null, ${ JSON.stringify( argv ) } ) `;
         const child = spawn( 'node', [ '-e', code ], {
            cwd: process.cwd(),
            stdio: 'inherit'
         } )
         child.on( 'error', e => {
            log.error( e.message )
            process.exit( 1 )
         } )
         child.on( 'exit', e => {
            log.verbose( '命令执行成功:' + e );
            process.exit( e )
         } )

      } catch ( e ) {
         log.error( e.message )
      }
   }
}
module.exports = index;


