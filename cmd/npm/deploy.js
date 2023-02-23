#!node
// mock>> ./deploy.js deploy.env 0
const { exec, getEnv, printLog, loadDeployEnv, getServiceId } = require('./deploy.jsp.js');
let env2 = process.argv[2]
let env3 = process.argv[3] != '0'
if (env2) {
    printLog(`.env=${env2}`)
    loadDeployEnv(env2)
}

const
    ci_env_profile = getEnv('ci_env_profile', 'dev'),
    ci_npm_run_script = getEnv('ci_npm_run_script', 'build'),
    ci_env_image_tag = getEnv('ci_env_image_tag', getEnv('BUILD_NUMBER', 'latest')),
    ci_env_registry = getEnv('ci_env_registry', 'image.ci:5000'),
    ci_docker_context_deploy = getEnv('ci_docker_context_deploy', 'default'),
    ci_docker_context_build = getEnv('ci_docker_context_build', 'default'),
    ci_container_git = getEnv('ci_container_git', 'git-docker-cli'),
    ci_container_compiler = getEnv('ci_container_compiler', 'node-complier'),
    //runtime resource config
    ci_compose_cpus = getEnv('ci_compose_cpus', '1'),
    ci_compose_memory = getEnv('ci_compose_memory', '512M'),
    ci_compose_replicas = getEnv('ci_compose_replicas', '1'),
    ci_compose_service_name = getEnv('ci_compose_service_name', getEnv('JOB_BASE_NAME', 'api-debug')), //${JOB_BASE_NAME}@Jenkins
    ci_compose_service_port = getEnv('ci_compose_service_port', '80'),
    ci_compose_network = getEnv('ci_compose_network'),
    ci_router_entry = getEnv('ci_router_entry', 'traefik'),
    ci_router_prefix = getEnv('ci_router_prefix', getEnv('ci_compose_service')),
    // compiler config
    ci_dockerfile = getEnv('ci_dockerfile', '/opt/make/compilers/npm/Dockerfile'),
    ci_workspace = getEnv('ci_workspace', '/opt/make/workspace'),
    ci_git_project = getEnv('ci_git_project'),
    ci_git_branch = getEnv('ci_git_branch', getEnv('ci_env_profile')),
    ci_git_src_dir = getEnv('ci_git_src_dir', ''),
    // env_profile
    ci_compose_image = `${ci_env_registry}/${ci_env_profile}/${ci_compose_service_name}:${ci_env_image_tag}`,
    // work_dir for source code & compiler, ${JOB_NAME}@Jenkins
    ci_work_dir = `${ci_workspace}/` + getEnv('JOB_NAME', `${ci_env_profile}/${ci_compose_service_name}`);

/** --------- start business coding -------- */
// { DOCKER_CONTEXT: context, cmd: 'the data' }
//exec("📌 print environments", process.env, 'pwd', 'env')

// 📌 workspace: git clone source-code
let env = {
    DOCKER_CONTEXT: ci_docker_context_build,
    cmd1: `rm -rf ${ci_work_dir} && mkdir -p ${ci_work_dir}`,
    cmd2: `git clone -b ${ci_git_branch} ${ci_git_project} ${ci_work_dir}/src`
}
printLog(JSON.stringify(env))
if (env3) {
    exec("📌 workspace: git clone source-code", env,
        `docker exec -i ${ci_container_git} bash -c "$cmd1"`,
        `docker exec -i ${ci_container_git} bash -c "$cmd2"`)
}

// 📌 compiler: npm install && build
env = {
    DOCKER_CONTEXT: ci_docker_context_build,
    work_dir: `${ci_work_dir}/src/${ci_git_src_dir}`,
    cmd_compiler: `npm install --registry https://registry.npmmirror.com/ --quiet && npm run ${ci_npm_run_script} --quiet`
}
printLog(JSON.stringify(env))
if (env3) {
    exec("📌 compiler: npm install && build", env,
        `docker exec -i -w $work_dir ${ci_container_compiler} bash -c "$cmd_compiler"`)
}

// 📌 build docker image && push to registry
env = {
    DOCKER_CONTEXT: ci_docker_context_build,
    work_dir: `${ci_work_dir}/src/${ci_git_src_dir}`,
    cmd_image_build: `docker build --force-rm --compress` +
        ` --build-arg ci_env_profile=${ci_env_profile}` +
        ` --build-arg ci_router_prefix=${ci_router_prefix}` +
        ` -t ${ci_compose_image} -f ${ci_dockerfile} .`,
    cmd_image_push: `docker push ${ci_compose_image}`
}
printLog(JSON.stringify(env))
if (env3) {
    exec("📌 build docker image && push to registry", env,
        `docker exec -i -w $work_dir ${ci_container_git} bash -c "$cmd_image_build"`,
        `docker exec -i ${ci_container_git} bash -c "$cmd_image_push"`)
}

// 📌 deploy service to swarm & running
/**
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

function cmdCreateService(service_name, image_name, servicePort, routeEntry, routePathPrefix, res_cpu, res_memory, res_replicas) {

}

if (env3) {
    let service_id = getServiceId(ci_docker_context_deploy, ci_compose_service_name)
    if (service_id !== false) {
        // create service
        env = {
            DOCKER_CONTEXT: ci_docker_context_deploy,
            command: ``
        }
    }
    else {
        // update service
    }
}