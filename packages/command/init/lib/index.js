'use strict';
const Command = require('@zxfc/command');
const Package = require('@zxfc/package');
const userHome = require('user-home');
const log = require('@zxfc/log');
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const fsE = require('fs-extra');
const semver = require('semver');
const ejs = require('ejs');
const glob = require('glob');
const { spinnerStart, sleep, execAsync } = require('@zxfc/tool');
const { getNpmLatestVersion } = require('@zxfc/get-npm-info');
const cilConfig = require('@zxfc/cli-config');

function index( arg ) {
    // console.info('arg',arg)
    return new InitCommand(arg);
}

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';
const TEMPLATE_TYPE_NORMAL = 'normal';
const TEMPLATE_TYPE_CUSTOM = 'custom';
const WHITE_LIST = ['npm', 'cnpm', 'yarn'];

class InitCommand extends Command {
    constructor( argv ) {
        super(argv);
    }

    init() {
        this.projectName = this._argv[0] || '';
        this.force = !!this._cmd.force;
        this.exec();
        log.verbose('project', this.projectName);
        log.verbose('force', this.force);
    }

    async exec() {
        try {
            const ret = await this.prepare();
            if (ret) {
                this.projectInfo = ret;
                await this.downloadTemplate();
                await this.installTemplate();
            }
        } catch ( e ) {

            if (process.env.LOG_LEVEL === 'verbose') {
                console.info(e);
            }
            log.error(e);
        }
    }

    async prepare() {
        // 1. 判断当前目录是否为空
        const template = cilConfig;
        if (!template || template.length === 0) {
            throw new Error('项目模板不存在');
        }
        this.template = template;
        // path.resolve('.')也可以实现效果
        const localPath = process.cwd();
        if (!this.cwdIsEmpty(localPath)) {
            let ifContinue = false;
            if (!this.force) {
                ifContinue = (await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifContinue',
                    default: false,
                    message: '当前文件夹不为空,是否继续创建项目',
                })).ifContinue;
                if (!ifContinue) {
                    return;
                }
            }

            if (ifContinue || this.force) {
                const { ifDel } = await inquirer.prompt({
                    type: 'confirm',
                    name: 'ifDel',
                    default: false,
                    message: '是否确认情况当前目录下的文件',
                });
                if (ifDel) {
                    fsE.emptyDirSync(localPath);
                }

            }
        }

        return this.getProjectInfo();
    }

    async getProjectInfo() {
        let projectInfo = {};

        function isValidateName( v ) {
            return /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(v);
        }

        const { type } = await inquirer.prompt({
            type: 'list',
            name: 'type',
            message: '请选择初始化类型',
            default: TYPE_PROJECT,
            choices: [
                {
                    name: '项目',
                    value: TYPE_PROJECT,
                },
                {
                    name: '组件',
                    value: TYPE_COMPONENT,
                },
            ],
        });
        log.verbose('type', type);
        const title = type === TYPE_PROJECT? '项目' : '组件';
        this.template = this.template.filter(( template ) => {
            if (!Array.isArray(template.tag)) {
                template.tag = [];
            }
            return template.tag.includes(type);
        });
        if(this.template.length<1) {
            throw new Error('没有任何模板可用')
        }
        let projectNamePrompt = [];
        if (isValidateName(this.projectName)) {
            projectInfo.projectName = this.projectName;
            projectInfo.className = this.projectName;

        } else {
            log.error('init项目名称不合法,需要重新输入项目名');
            projectNamePrompt.push({
                type: 'input',
                name: 'projectName',
                message: `请输入${title}名称`,
                default: '',
                validate( v ) {
                    /**
                     * 项目名称的规则
                     * 1.首字符必须为英文字符
                     * 2.尾字符必须为英文或数字，不能为字符
                     * 3.字符仅允许"-_"
                     */
                    const done = this.async();
                    setTimeout(() => {
                        if (!isValidateName(v)) {
                            done(`请输入正确的${title}名称：首字符必须为英文字符、尾字符必须为英文或数字，不能为字符、字符仅允许"-_"`);
                            return;
                        } else {
                            done(null, true);
                        }
                    }, 0);

                },
                filter( v ) {
                    return v;
                },
            });
        }
        projectNamePrompt.push({
            type: 'input',
            name: 'projectVersion',
            message: '请输入版本号',
            default: '1.0.0',
            validate( v ) {
                const done = this.async();
                setTimeout(() => {
                    if (!(!!semver.valid(v))) {
                        done(`请输入正确的版本号`);
                        return;
                    } else {
                        done(null, true);
                    }
                }, 0);
            },
            filter( v ) {
                const version = semver.valid(v);
                return version? version : v;
            },
        }, {
            name: 'projectTemplate',
            type: 'list',
            message: `请选择${title}模板`,
            choices: this.createTemplateChoice(),
        });
        if (type === TYPE_PROJECT) {
            projectInfo = {
                ...projectInfo,
                ...await inquirer.prompt(projectNamePrompt),
            };
        } else if (type === TYPE_COMPONENT) {
            const descriptionPrompt = {
                type: 'input',
                name: 'componentDescription',
                message: '请输入组件描述',
                validate( v ) {
                    /**
                     * 项目名称的规则
                     * 1.首字符必须为英文字符
                     * 2.尾字符必须为英文或数字，不能为字符
                     * 3.字符仅允许"-_"
                     */
                    const done = this.async();
                    setTimeout(() => {
                        if (!v) {
                            done(`组件描述不能为空`);
                            return;
                        } else {
                            done(null, true);
                        }
                    }, 0);

                },
            };
            projectNamePrompt.push(descriptionPrompt);
            projectInfo = {
                ...projectInfo,
                ...await inquirer.prompt(projectNamePrompt),
            };
        }
        if (projectInfo.projectName) {
            // 转成驼峰后最前面会有-，所以replace掉
            projectInfo.className = require('kebab-case')(projectInfo.projectName).replace(/^-/, '');
        }
        if (projectInfo.componentDescription) {
            projectInfo.description = projectInfo.componentDescription;
        }
        log.verbose('projectInfo', projectInfo);
        return {
            ...projectInfo,
            version: projectInfo.projectVersion || '1.0.0',
            type,
        };
    }

    cwdIsEmpty( localPath ) {
        const files = fs.readdirSync(localPath).filter(( file ) => {
            return !file.startsWith('.') && !['node_modules'].includes(file);
        });
        return !files || files.length < 1;
    }

    async downloadTemplate() {
        const { projectTemplate } = this.projectInfo;
        const templateInfo = this.template.find(item => item.npmName === projectTemplate);
        this.templateInfo = templateInfo;
        const targetPath = path.resolve(userHome, '.zxf', 'template');
        const storeDir = path.resolve(userHome, '.zxf', 'template', 'node_modules');
        const { npmName, version: packageVersion } = templateInfo;
        log.verbose('templateInfo', templateInfo);
        const templateNpm = new Package({
            targetPath,
            storeDir,
            packageName: npmName,
            packageVersion,
        });
        if (!await templateNpm.exists()) {
            const spinner = spinnerStart('模板下载中....');
            let haveError = false;
            try {
                await templateNpm.install();
                await sleep(800);
                this.templateNpm = templateNpm;
            } catch ( e ) {
                haveError = true;
                throw e;
            } finally {
                spinner.stop(true);
                haveError? log.error('模板下载失败') : log.info('模板下载成功');
            }

        } else {
            const spinner = spinnerStart('模板更新中....');
            let haveError = false;
            try {
                await templateNpm.update();
                await sleep(800);
                this.templateNpm = templateNpm;
            } catch ( e ) {
                haveError = true;
                throw e;
            } finally {
                spinner.stop(true);
                haveError? log.error('模板更新失败') : log.info('模板更新成功');
            }
        }
    }

    async installTemplate() {
        if (this.templateInfo) {
            if (!this.templateInfo.type) {
                this.templateInfo.type = TEMPLATE_TYPE_NORMAL;
            }
            if (this.templateInfo.type === TEMPLATE_TYPE_NORMAL) {
                await this.installNormalTemplate();
            } else if (this.templateInfo.type === TEMPLATE_TYPE_CUSTOM) {
                await this.installCustomTemplate();
            } else {
                throw  new Error('项目模板类型无法识别');
            }
        } else {
            throw  new Error('项目模板信息不存在');
        }
    }

    async installNormalTemplate() {
        // copy当前模板到当前目录
        let spinner = spinnerStart('正在安装模板');
        let haveError = false;
        try {
            const templatePath = path.resolve(this.templateNpm.cacheFilePath, 'template');
            const targetPath = process.cwd();
            fsE.ensureDirSync(targetPath);
            fsE.ensureDirSync(templatePath);
            fsE.copySync(templatePath, targetPath);
        } catch ( e ) {
            console.error(e);
            haveError = true;
            throw e;
        }
        await sleep(800);
        spinner.stop(true);
        haveError? log.error('安装失败') : log.info('安装成功');
        const { installCommand, startCommand, ignore: ignoreList } = this.templateInfo;
        const ignore = ['**/node_modules/**'].concat(ignoreList || []);
        try {
            await this.ejsRender({
                ignore,
            });
        } catch ( e ) {
            log.verbose('模板渲染失败', e);
        }
        log.info('安装依赖中...')
        const ret = await this.execCommand(installCommand);
        if (ret === 0) {
            console.info(startCommand);
            log.info('启动项目中...')
            await this.execCommand(startCommand);
        } else {
            throw new Error('安装依赖失败');
        }

    }

    async execCommand( commandStr, options = {
        stdio: 'inherit',
        cwd: process.cwd(),
    } ) {
        if (typeof commandStr === 'string') {
            const command = commandStr.split(' ');
            if (command.length > 0) {
                const [cmd, ...args] = command;
                if (WHITE_LIST.includes(cmd)) {
                    return await execAsync(cmd, args, options);
                } else {
                    throw new Error(`未知命令${cmd}`);
                }
            }
        }
    }

    async installCustomTemplate() {
        if (await this.templateNpm.exists()) {
            const rootFile = this.templateNpm.getRootFilePath();
            if (fs.existsSync(rootFile)) {
                log.notice('开始执行自定义模板');
                const options = {
                    ...this.templateInfo,
                    targetPath: process.cwd(),
                    ...this.projectInfo,
                    sourcePath: path.resolve(this.templateNpm.cacheFilePath, 'template'),
                };
                const code = `require('${rootFile}')(${JSON.stringify(options)})`;
                log.verbose('自定义模板传入参数为:', options);
                await execAsync('node', ['-e', code], {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                });
            } else {
                throw new Error('自定义模板入口文件不存在');
            }
        } else {
            throw new Error('模板信息异常');
        }
    }

    async ejsRender( option ) {
        const dir = process.cwd();
        return new Promise(( resolve, reject ) => {
            glob('**', {
                cwd: dir,
                nodir: true,
                ...option,
            }, ( error, files ) => {
                if (error) {
                    reject(error);
                }
                Promise.all(files.map(( file ) => {
                    const filePath = path.join(dir, file);
                    return new Promise(( resolve1, reject1 ) => {
                        ejs.renderFile(filePath, this.projectInfo, {}, ( error, result ) => {
                            if (error) {
                                reject1(error);
                            } else {
                                fsE.writeFileSync(filePath, result);
                                resolve1(result);
                            }
                        });
                    });
                })).then(() => {
                    resolve(true);
                }).catch(( err ) => {
                    reject(err);
                });
            });
        });
    }

    createTemplateChoice() {
        return this.template.map(( item ) => {
            return {
                value: item.npmName,
                name: item.name,
            };
        });
    }
}

module.exports.InitCommand = InitCommand;
module.exports = index;


