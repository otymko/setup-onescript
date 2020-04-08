const core = require('@actions/core');

async function run() {
  try {
    const osVersion = core.getInput('version');
    console.log('Hello world ${osVersion}');
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()