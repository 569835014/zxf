'use strict';
const { isObject } = require('@zxfc/tool');
const formatPath = require('@zxfc/format-path');
const pathExists = require('path-exists').sync;
const pkgDir = require('pkg-dir').sync;
const path = require('path');
const fse = require('fs-extra');
const npmInstall = require('npminstall');
const { getDefaultRegistry, getNpmLatestVersion } = require('@zxfc/get-npm-info');

class Package {
    constructor( options ) {
        if (!options) {
            throw new Error('Package类的参数options不能为空！');
        }
        if (!isObject(options)) {
            throw new Error('Package类的参数options必须为object');
        }
        // package的路径
        this.targetPath = options.targetPath;
        // 缓存package的存储路径
        this.storeDir = options.storeDir;
        // package的name
        this.packageName = options.packageName;
        // package的version
        this.packageVersion = options.packageVersion;
        // 缓存的前缀
        this.cacheFilePathPreFix = this.packageName.replace('/', '_');
    }

    // 把版本是last的转成具体版本
    async prepare() {

        if (this.storeDir && !pathExists(this.storeDir)) {
            fse.mkdirpSync(this.storeDir);
        }
        this.packageVersion = await getNpmLatestVersion(this.packageName);
    }

    // 判断当前Package是否存在
    async exists() {

        await this.prepare();
        if (this.storeDir) {
            return pathExists(this.cacheFilePath);
        } else {
            return pathExists(this.targetPath);
        }

    }

    get cacheFilePath() {
        return this.getSpecificCacheFilePath(this.packageVersion);
    }


    getSpecificCacheFilePath( packageVersion ) {
        return path.resolve(this.storeDir, `_${this.cacheFilePathPreFix}@${packageVersion}@${this.packageName}`);
    }

    // 安装Package
    async install() {
        // 获得最新的版本
        await this.prepare();
        return npmInstall({
            root: this.targetPath,
            storeDir: this.storeDir,
            registry: getDefaultRegistry(true),
            pkgs: [
                {
                    name: this.packageName,
                    version: this.packageVersion,
                },
            ],
        });
    }

    // 更新Package
    async update() {
        await this.prepare();
        // 当前最新的npm模块版本号
        const latestPackageVersion = await getNpmLatestVersion(this.packageName);
        // 当前最新版本号对应的路径
        const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion);
        // 如果不存在进行npm i安装
        if (!pathExists(latestFilePath)) {
            await npmInstall({
                root: this.targetPath,
                storeDir: this.storeDir,
                registry: getDefaultRegistry(true),
                pkgs: [
                    {
                        name: this.packageName,
                        version: latestPackageVersion,
                    },
                ],
            });
            this.packageVersion = latestPackageVersion;
        } else {
            this.packageVersion = latestPackageVersion;
        }

        return latestFilePath;
    }

    // 获取入口文件的路径
    getRootFilePath() {
        function _getRootFilePath( targetPath ) {
            const dir = pkgDir(targetPath);
            if (dir) {
                const pkgFile = require(path.join(dir, 'package'));
                if (pkgFile && (pkgFile.main)) {
                    return formatPath(path.resolve(dir, pkgFile.main));
                }
                return null;
            }
        }

        if (this.storeDir) {
            // 获得缓存的入口文件
            return _getRootFilePath(this.cacheFilePath);
        } else {
            // 获得非缓存
            return _getRootFilePath(this.targetPath);
        }
    }
}

module.exports = Package;
