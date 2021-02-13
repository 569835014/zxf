'use strict';

const axios = require('axios');
const urlJoin = require('url-join');
const semver = require('semver');
const log = require('@zxfc/log');

function getNpmInfo( npmName, registry ) {
    if (!npmName) return null;
    const _registry = registry || getDefaultRegistry();
    const npmInfoUrl = urlJoin(_registry, npmName);
    log.verbose('npmInfoUrl', npmInfoUrl);
    return axios.get(npmInfoUrl).then(( response ) => {
        if (response.status === 200) {
            return response.data;
        }
        return null;
    }).catch(err => {
        return Promise.reject(err);
    });
}

async function getNpmVersion( npmName, registry ) {
    const data = await getNpmInfo(npmName, registry);
    if (data) {
        return Object.keys(data.versions);
    } else {
        return [];
    }
}

function getSemverVersion( baseVersion, versions = [] ) {
    return versions.filter(version => semver.satisfies(version, `^${baseVersion}`)).sort(( a, b ) => {
        return semver.gt(b, a);
    });
}

async function getNpmSemverVersion( baseVersion, npmName, registry ) {
    const versions = await getNpmVersion(npmName, registry);
    const newVersions = getSemverVersion(baseVersion, versions);
    if (newVersions && newVersions.length > 0) return newVersions[0];
}

function getDefaultRegistry( isOriginal = true ) {
    return isOriginal? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org';
}

/**
 * 获取到latest版本的具体版本
 * @param npmName
 * @param registry
 * @return {Promise<string>}
 */
async function getNpmLatestVersion( npmName, registry ) {
    let versions = await getNpmVersion(npmName, registry);
    if (versions) {
        const newVersions = versions.sort((( a, b ) => semver.gt(b, a) ? 1 : -1))
        log.verbose(npmName, newVersions)
        return newVersions[0];
    }
    return null;
}

module.exports = {
    getNpmSemverVersion,
    getDefaultRegistry,
    getNpmLatestVersion,
};