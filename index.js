const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');
const tmp = require('tmp');

const patform = process.platform;

async function run() {
  try {
    const osVersion = core.getInput('version');
    var osVersionStr = getVersionString(osVersion);
    console.log('Версия: ' + osVersionStr);
    console.log('Платформа: ' + patform)
    if (patform == 'win32') {
      await exec.exec('curl -L https://github.com/oscript-library/ovm/releases/download/v1.0.0-RC15/ovm.exe --output ovm.exe'); 
      // updatePath();
      await exec.exec('./ovm.exe use --install dev')
      await exec.exec('oscript -version')
      // await exec.exec('ovm ls')

      // console.log('Загрузка');
      // await exec.exec('curl -v https://oscript.io/downloads/' + osVersionStr + '/exe?bitness=x64 --output oscript.exe');
      // console.log('Установка');
      // await exec.exec('./oscript.exe /verysilent /norestart /log=oscript.log');

      // console.log('Лог установки');
      // await exec.exec('powershell Get-Content -Path oscript.log');
      // console.log('Обновление Path');
      // updatePath();

      // console.log('Удаление временного файла');
      // fs.unlinkSync('./oscript.exe');

    } else if (patform == 'linux') {
      var tmpFile = tmp.fileSync();
      fs.writeFileSync(tmpFile.name, installLinux(osVersionStr, 'x64'));

      await exec.exec('bash ' + tmpFile.name);
      fs.unlinkSync(tmpFile.name);

      await exec.exec('sudo chmod -R ugo+rwx /usr/share/oscript');

      await exec.exec('curl -v https://hub.oscript.io/download/opm/opm.ospx --output opm.ospx');
      await exec.exec('sudo opm install -f opm.ospx');
      fs.unlinkSync('opm.ospx');
      
      await exec.exec('oscript --version');
    
    } else {
      throw new Error('OS not support');
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

function getVersionString(value) {
  var version = value.split('.').join('_');
  return version;
}

function updatePath() {

  const OLD_PATH = process.env.PATH;
  // PATH = OLD_PATH + ";C:\/Program Files\/OneScript\/bin;";
  let thisCat = require('path').dirname(require.main.filename);
  console.log('Каталог ' + thisCat);
  let PATH = OLD_PATH + ";" + thisCat + ";";
  core.exportVariable('Path', PATH);

}

function installLinux(version, bitness) {
 var value = [];
 value.push('#!/bin/bash');
 value.push('sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF');
 value.push('echo "deb http://download.mono-project.com/repo/ubuntu trusty main" | sudo tee /etc/apt/sources.list.d/mono-official.list');
 value.push('sudo apt-get update');
 value.push('sudo apt-get install mono-complete mono-devel');
 value.push('curl -v https://oscript.io/downloads/' + version + '/deb?bitness=' + bitness + ' --output os.deb');
 value.push('sudo dpkg -i os.deb');
 value.push('sudo apt install -f');
 return value.join('\n');
}

run()
