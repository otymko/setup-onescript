const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require('fs');

const patform = process.platform;

async function run() {
  try {
    const osVersion = core.getInput('version');
    var osVersionStr = getVersionString(osVersion);
    console.log('Версия: ' + osVersionStr);
    if (patform == 'win32') {
      console.log('Загрузка');
      await exec.exec('curl -v https://oscript.io/downloads/' + osVersionStr + '/exe?bitness=x64 --output oscript.exe');
      console.log('Установка');
      await exec.exec('./oscript.exe /verysilent /norestart /log=oscript.log');

      console.log('Лог установки');
      await exec.exec('powershell Get-Content -Path oscript.log');
      console.log('Обновление Path');
      updatePath();

      console.log('Удаление временного файла');
      await fs.unlinkSync('./oscript.exe');

    } else if (patform == 'linux') {

      await exec.exec('sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF')
      await exec.exec('echo "deb http://download.mono-project.com/repo/ubuntu trusty main" | sudo tee /etc/apt/sources.list.d/mono-official.list')
      await exec.exec('sudo apt-get update')
      // await exec.exec('sudo apt-get install mono-complete mono-devel')
      await exec.exec('- wget -O os.deb http://oscript.io/downloads/' + osVersionStr + '/exe?bitness=x64')
      await exec.exec('sudo dpkg -i os.deb; sudo apt install -f')
      await exec.exec('oscript --version')
    
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
  PATH = OLD_PATH + ";C:\/Program Files\/OneScript\/bin;";
  core.exportVariable('Path', PATH);
}

run()