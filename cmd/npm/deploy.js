const { spawnSync } = require('node:child_process');

var task_step = 0;

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
  console.log(`🟢 ${task_step}. ${getNow()} -- ${task}`)
  const cmd = spawnSync('docker', cmd_args, { stdio: 'inherit', env: { DOCKER_CONTEXT: context } });
  if (cmd.status > 0) {
    console.error(`🔴 context=${context}, command=${command}, :${dc.status}`);
  } else {
    console.log('>> spawn sync success');
  }
}

exec("text01", 'default', ['service', 'ls'])
exec("text01", 'default', ['ps', '-a'])
