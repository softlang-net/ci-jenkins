const { spawnSync } = require('node:child_process');
const _path = require('path')
const fs = require('fs');

/** load environment files
 * @param {string} envFilePath the filepath ./deploy.env
 */
function loadDeployEnv(envFilePath) {
  if (fs.existsSync(envFilePath)) {
    fs.readFileSync(envFilePath, { encoding: 'utf8', flag: 'r' }).
      split('\n').filter((s1) => { return s1 }).map(item1 => {
        let ix1 = item1.indexOf('=')
        process.env[item1.substring(0, ix1)] = item1.substring(ix1 + 1)
      })
  } else {
    printLog(`Load env [${envFilePath}] failed`)
  }
}

/** load environment files
 * @param {string} paths the paths array to join
 * @returns {string} the concated path
 */
function concatPath(...paths) {
  return _path.join(...paths)
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

/** execute shell command with env-variables && sh-c by spawnSync
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
      printLog('√done\n')
    }
  }
  console.log(`🔵 ${getNow()} done! ${task}\n`)
}

/** getServiceId by service name, return false if not exist, service-id if success.
 * @param {string} docker_context The docker context
 * @param {string} service_name The service name
 * @returns {(string|boolean)} the servicd_id or false if service not exist. 
 */
function getServiceId(docker_context, service_name) {
  let env = { DOCKER_CONTEXT: docker_context }
  let cmd = `docker service inspect --format service_id={{.ID}} '${service_name}'`;
  let cmdSpawn = spawnSync('sh', ['-c', cmd], { env: env });
  printLog(`service <${service_name}>, docker context=${docker_context}, return=${cmdSpawn.status}`);
  if (cmdSpawn.status != 0) {
    console.error(cmdSpawn.stderr.toString())
    return false
  } else {
    return cmdSpawn.stdout.toString()
  }
}

/** make cli-command for update service
 * @param {string} service_name The service name
 * @param {string} image_name The docker image name
 * @param {string} servicePort The service Port, default=80
 * @param {string} routeEntry The traefik name
 * @param {string} routePathPrefix The router PathPrefix
 * @param {string} res_cpu The router PathPrefix
 * @param {string} res_memory The router PathPrefix
 * @param {string} res_replicas The router PathPrefix
 * @returns {string} the cli-command for update service
 */
function cmdUpdateService(service_name, image_name, servicePort, routeEntry, routePathPrefix, res_cpu, res_memory, res_replicas) {
  return `docker service update -d`
    + ` --label-add "cigo=softlang"`
    + ` --label-add "io.portainer.accesscontrol.public"`
    + ` --label-add "traefik.http.routers.${service_name}.entrypoints=${routeEntry}"`
    + ` --label-add "traefik.http.routers.${service_name}.service=${service_name}"`
    + ` --label-add "traefik.http.routers.${service_name}.rule=PathPrefix(\`${routePathPrefix}\`)"`
    + ` --label-add "traefik.http.services.${service_name}.loadbalancer.server.port=${servicePort}"`
    + ` --limit-cpu ${res_cpu}`
    + ` --limit-memory ${res_memory}`
    + ` --replicas ${res_replicas}`
    + ` --image ${image_name} ${service_name}`
}

/** make cli-command for create new service
* @param {string} service_name The service name
* @param {string} image_name The docker image name
* @param {string} servicePort The service Port, default=80
* @param {string} routeEntry The traefik name
* @param {string} routePathPrefix The router PathPrefix
* @param {string} res_cpu The router PathPrefix
* @param {string} res_memory The router PathPrefix
* @param {string} res_replicas The router PathPrefix
* @param {string} overlay_network The swarm-overlay network
* @returns {string} the cli-command for update service
*/
function cmdCreateService(service_name, image_name, servicePort, routeEntry, routePathPrefix, res_cpu, res_memory, res_replicas, overlay_network) {
  return `docker service create -d --mode replicated`
    + ` --network ${overlay_network}`
    + ` --update-parallelism 1`
    + ` --update-delay 30s`
    + ` --restart-delay 30s`
    + ` --restart-window 0`
    + ` --restart-max-attempts 10`
    + ` --name ${service_name}`
    + ` --limit-cpu ${res_cpu}`
    + ` --limit-memory ${res_memory}`
    + ` --replicas ${res_replicas}`
    + ` --label "cigo=softlang"`
    + ` --label "traefik.enable=true"`
    + ` --label "io.portainer.accesscontrol.public"`
    + ` --label "traefik.http.routers.${service_name}.entrypoints=${routeEntry}"`
    + ` --label "traefik.http.routers.${service_name}.service=${service_name}"`
    + ` --label "traefik.http.routers.${service_name}.rule=PathPrefix(\`${routePathPrefix}\`)"`
    + ` --label "traefik.http.services.${service_name}.loadbalancer.server.port=${servicePort}"`
    + ` ${image_name}`;
}

module.exports = {
  exec, concatPath, getServiceId, cmdCreateService, cmdUpdateService, getEnv, hasEnv, printLog, getNow, loadDeployEnv
};
