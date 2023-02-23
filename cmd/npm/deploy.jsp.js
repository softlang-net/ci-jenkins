const { spawnSync } = require('node:child_process');
const fs = require('fs');

/** load environment files
 * @param {string} envFilePath the filepath ./deploy.env
 */
function loadDeployEnv(envFilePath) {
  fs.readFileSync(envFilePath, { encoding: 'utf8', flag: 'r' }).
    split('\n').filter((s1) => { return s1 }).map(item1 => {
      let ix1 = item1.indexOf('=')
      process.env[item1.substring(0, ix1)] = item1.substring(ix1 + 1)
    })
}

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
  if (log.length) {
    console.log('>> '.concat(log))
  } else {
    console.log('')
  }
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
 * @param {NodeJS.ProcessEnv} env The docker context
 * @param {ReadonlyArray<string>} cmd_args The command args
 */
function exec(task, env, ...commands) {
  console.log(`✅ ${getNow()} start ${task}`)
  for (let cmd of commands) {
    printLog(`cmd=${cmd}`)
    const cmdSpawn = spawnSync('sh', ['-c', cmd], { stdio: 'inherit', env: env });
    if (cmdSpawn.status != 0) {
      console.error(`🔴 ${getNow()} error! ${task}, ❎code=${cmdSpawn.status}`);
      process.exit(cmdSpawn.status);
    } else {
      printLog('√done')
    }
  }
  console.log(`🔵 ${getNow()} done! ${task}\n`)
}

/**
 * @param {string} docker_context The docker context
 * @param {string} service_name The service name
 * @returns {(string|boolean)} the servicd_id or false if service not exist. 
 */
function getServiceId(docker_context, service_name) {
  let env = { DOCKER_CONTEXT: docker_ctx }
  let cmd = `docker service inspect --format service_id={{.ID}} '${service_name}'`;
  let cmdSpawn = spawnSync('sh', ['-c', cmd], { env: env });
  printLog(`service <${service_name}>, docker context=${docker_ctx} / cli=${docker_cli}, return=${cmdSpawn.status}`);
  if (cmdSpawn.status != 0) {
    console.error(cmdSpawn.stderr.toString())
    return false
  } else {
    return cmdSpawn.stdout.toString()
  }
}

module.exports = {
  exec, getServiceId, getEnv, hasEnv, printLog, getNow, loadDeployEnv
};
