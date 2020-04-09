const core = require('@actions/core');
const exec = require('@actions/exec');

const patform = process.platform;

async function run() {
  try {
    const osVersion = core.getInput('version');
    var osVersionStr = getVersionString(osVersion);
    console.log('Версия: ' + osVersionStr);
    if (patform == 'win32') {
      console.log('Загрузка');
      await exec.exec('curl -v https://oscript.io/downloads/1_3_0/exe?bitness=x86 --output oscript.exe');
      console.log('Установка');
      await exec.exec('./oscript.exe /verysilent /norestart');
      console.log('Удаление временного файла');
      await exec.exec('del ./oscript.exe');
    } else {
      throw new Error('OS not support');
    }
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

function getVersionString(value) {
  var version = osVersion.replace('.', '_');  
  return version;
}

run()