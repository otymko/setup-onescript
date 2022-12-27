const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const tmp = require('tmp');
const path = require('path');
const io = require('@actions/io');

const platform = process.platform;

async function run() {
    try {

        const osVersion = core.getInput('version');

        console.log('OS: ' + platform);

        if (!(platform == 'win32' || platform == 'linux' || platform == 'darwin')) {
            throw new Error('OS not support');
        }

        if (core.isDebug()) {
            core.exportVariable('LOGOS_CONFIG', "logger.rootLogger=DEBUG");
        }

        let pathToOVM = 'ovm.exe';
        if (platform == 'win32') {
            pathToOVM = path.dirname(__dirname) + '/' + 'ovm.exe';
        }
        await exec.exec('curl -L https://github.com/oscript-library/ovm/releases/download/v1.0.0-RC16/ovm.exe --output ' + pathToOVM);

        if (platform == 'win32') {
            let pathToOVM = path.dirname(__dirname);
            console.log("dir: " + pathToOVM);
            core.addPath(pathToOVM);
        }

        if (platform == 'linux') {

            var tmpFile = tmp.fileSync();
            fs.writeFileSync(tmpFile.name, installLinux());
            await exec.exec('bash ' + tmpFile.name);
            fs.unlinkSync(tmpFile.name);

        }

        if (platform == 'darwin') {
            var tmpFile = tmp.fileSync();
            fs.writeFileSync(tmpFile.name, installMacOs());
            await exec.exec('bash ' + tmpFile.name);
            fs.unlinkSync(tmpFile.name);
        }

        await exec.exec('ovm install ' + osVersion);
        await exec.exec('ovm use ' + osVersion);

        let output = '';
        const options = {};
        options.listeners = {
            stdout: (data) => {
                output += data.toString();
            }
        };
        await exec.exec('ovm', ['which', 'current'], options);
        let pathOscript = path.dirname(output);

        core.addPath(pathOscript);

        if (platform != 'win32') {
            core.exportVariable('OSCRIPTBIN', pathOscript);
            core.exportVariable('PATH', '$OSCRIPTBIN:' + process.env.PATH);
        }

        if (platform == 'linux') {
            await exec.exec('curl -L https://hub.oscript.io/download/opm/opm-1.0.7.ospx --output opm.ospx');
            if (osVersion == '1.2.0') {
                await exec.exec('mkdir tmp');
                await exec.exec('unzip opm.ospx -d tmp');
                await exec.exec('unzip -o ./tmp/content.zip -d /home/runner/.local/share/ovm/current/lib/opm');
            }
            await exec.exec('opm install -f opm.ospx');
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

function installLinux() {
    var value = [];
    value.push('#!/bin/bash');
    value.push('sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF');
    value.push('echo "deb http://download.mono-project.com/repo/ubuntu trusty main" | sudo tee /etc/apt/sources.list.d/mono-official.list');
    value.push('sudo apt-get update');
    value.push('sudo apt-get install mono-complete mono-devel');
    value.push('sudo mv ovm.exe /usr/local/bin/');

    let cmd = 'mono /usr/local/bin/ovm.exe "$@"';
    value.push("echo '" + cmd + "' | sudo tee /usr/local/bin/ovm");

    value.push('sudo chmod +x /usr/local/bin/ovm');
    return value.join('\n');
}

function installMacOs() {
    var value = [];
    value.push('#!/bin/bash');
    value.push('mv ovm.exe /usr/local/bin/');
    let cmd = 'mono /usr/local/bin/ovm.exe "$@"';
    value.push("echo '" + cmd + "' | tee /usr/local/bin/ovm");
    value.push('sudo chmod +x /usr/local/bin/ovm');
    return value.join('\n');
}

run()