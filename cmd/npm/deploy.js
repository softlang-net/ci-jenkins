const { spawnSync } = require('node:child_process');

var task_step = 0;
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
function exec(task, context, ...cmd_args) {
  task_step++;
  console.log(`🟢 start ${task_step}. ${getNow()} ${context}>> ${task}`)
  const cmd = spawnSync('ls', cmd_args, { stdio: 'inherit', env: { DOCKER_CONTEXT: context } });
  if (cmd.status != 0) {
    console.error(`🔴 error ${task_step}. ${getNow()} ${context}>> ${task}, ❎code=${cmd.status}`);
  } else {
    // console.error(`🔴 error ${task_step}. ${getNow()} ${context}>> ${task}, ❎code=${cmd.status}`);
    console.log(`✅ done! ${task_step}. ${getNow()} ${context}>> ${task}`)
  }
}

/** --------- start business coding -------- */

//exec("text01", 'default', ['service', 'ls'])
exec("text02", 'default', ['-a'])

console.log(`aaa=${getEnv('aaa', 4565)}`)
console.log(`bbb=${getEnv('bbb', 'go234')}`)
