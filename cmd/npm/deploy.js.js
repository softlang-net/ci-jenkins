const { spawnSync } = require('node:child_process');
const { exit } = require('node:process');

/**
 * @param {string} key the key name of environment
 * @param {string} defaultValue return the default value if not exist the key
 */
function getEnv(key, defaultValue = '') {
  return key in process.env ? process.env[key] : defaultValue;
}

/** check the environment has the key
 * @param {string} key the key name of environment
 */
function hasEnv(key) {
  return key in process.env;
}

/**
 * @param {ReadonlyArray<string>} log The command args
 */
function printLog(...log) {
  console.log(">> ".concat(log))
}

// print current datetime
function getNow() {
  const dateObj = new Date();
  let year = dateObj.getFullYear();
  let month = ('0' + (dateObj.getMonth() + 1)).slice(-2);
  let date = ('0' + dateObj.getDate()).slice(-2);
  let hour = ('0' + dateObj.getHours()).slice(-2);
  let minute = ('0' + dateObj.getMinutes()).slice(-2);
  let second = ('0' + dateObj.getSeconds()).slice(-2);
  const time = `${year}/${month}/${date} ${hour}:${minute}:${second}`;
  return time
}

/**
 * @param {string} task The task info
 * @param {string} context The docker context
 * @param {ReadonlyArray<string>} cmd_args The command args
 */
function exec(task, context, ...commands) {
  console.log(`✅ ${getNow()} start ${context}>> ${task}`)
  for (let cmd of commands) {
    printLog(`cmd=${cmd}`)
    const cmdSpawn = spawnSync('sh', ['-c', cmd], { stdio: 'inherit', env: { DOCKER_CONTEXT: context } });
    if (cmdSpawn.status != 0) {
      console.error(`🔴 ${getNow()} error! ${context}>> ${task}, ❎code=${cmdSpawn.status}`);
      exit(cmdSpawn.status);
    } else {
      printLog(`cmd=${cmd}`)
    }
  }
  console.log(`🔵 ${getNow()} done! ${context}>> ${task}\n`)
}

module.exports = {
  exec, getEnv, hasEnv, printLog, getNow
};
