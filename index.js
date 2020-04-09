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
      await exec.exec('curl -v https://oscript.io/downloads/1_3_0/exe?bitness=x64 --output oscript.exe');
      console.log('Установка');
      await exec.exec('./oscript.exe /verysilent /norestart /log=oscript.log');
      // console.log('Лог установки')
      // await exec.exec('powershell Get-Content -Path oscript.log');
      console.log('Удаление временного файла');
      await fs.unlinkSync('./oscript.exe');


      const OLD_PATH = process.env.PATH;
      PATH = OLD_PATH + "C:\/Program Files\/OneScript\/bin;";
      core.exportVariable('Path', PATH);

      console.log(PATH);

    } else {
      throw new Error('OS not support');
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

function getVersionString(value) {
  var version = value.replace('.', '_');
  return version;
}

run()