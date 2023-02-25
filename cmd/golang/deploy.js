#!/usr/bin/node
// mock>> ./deploy.js deploy.env 0
const { exec, getEnv, printLog, loadDeployEnv, getServiceId, cmdCreateService, cmdUpdateService, concatPath } = require('../shared/cigo.js');
let env2 = process.argv[2]
let env3 = process.argv[3] != '0'
if (env2) {
    printLog(`.env=${env2}`)
    loadDeployEnv(env2)
}

const
    ci_env = getEnv('ci_env', 'dev'),
    ci_image_tag = getEnv('ci_image_tag', getEnv('BUILD_NUMBER', 'latest')),
    ci_image_registry = getEnv('ci_image_registry', 'image.ci:5000'),
    ci_docker_context_deploy = getEnv('ci_docker_context_deploy', 'default'),
    ci_docker_context_build = getEnv('ci_docker_context_build', 'default'),
    ci_container_git = getEnv('ci_container_git', 'git-docker-cli'),
    //ci_container_compiler = getEnv('ci_container_compiler', 'node-complier'),
    ci_app_cpus = getEnv('ci_app_cpus', '1'),
    ci_app_memory = getEnv('ci_app_memory', '512M'),
    ci_app_replicas = getEnv('ci_app_replicas', '1'),
    ci_app_name = getEnv('ci_app_name', getEnv('JOB_BASE_NAME', 'api-debug')), //${JOB_BASE_NAME}@Jenkins
    ci_app_port = getEnv('ci_app_port', '80'),
    ci_app_network = getEnv('ci_app_network'),
    ci_app_entry = getEnv('ci_app_entry', 'traefik'),
    ci_app_prefix = getEnv('ci_app_prefix', `/${ci_app_name}`),
    // compiler config
    ci_dockerfile = getEnv('ci_dockerfile', '/opt/make/compilers/golang/Dockerfile'),
    ci_workspace = getEnv('ci_workspace', '/opt/make/workspace'),
    ci_git_project = getEnv('ci_git_project'),
    ci_git_branch = getEnv('ci_git_branch', ci_env),
    ci_git_src_dir = getEnv('ci_git_src_dir', ''),
    ci_image_name = `${ci_image_registry}/${ci_env}/${ci_app_name}:${ci_image_tag}`,
    // work_dir for source code & compiler, ${JOB_NAME}@Jenkins
    ci_work_dir = concatPath(`${ci_workspace}`, getEnv('JOB_NAME', `${ci_env}/${ci_app_name}`));

/** --------- start business coding -------- */
// { DOCKER_CONTEXT: context, cmd: 'cli-command' }
//exec("📌 print environments", process.env, 'pwd', 'env')
// 📌 workspace: git clone source-code
let env = {
    DOCKER_CONTEXT: ci_docker_context_build,
    cmd1: `rm -rf ${ci_work_dir} && mkdir -p ${ci_work_dir}`,
    cmd2: `git clone -b ${ci_git_branch} ${ci_git_project} ${ci_work_dir}/src`
}
printLog(JSON.stringify(env, null, 2))
if (env3) {
    exec("📌 workspace: git clone source-code", env,
        `docker exec -i ${ci_container_git} bash -c "$cmd1"`,
        `docker exec -i ${ci_container_git} bash -c "$cmd2"`)
}

// 📌 compiler & build image from Dockerfile (golang->/app/launch)
env = {
    DOCKER_CONTEXT: ci_docker_context_build,
    work_dir: `${ci_work_dir}/src/${ci_git_src_dir}`,
    cmd_image_build: `docker build --force-rm --compress` +
        ` --build-arg ci_env=${ci_env}` +
        ` --build-arg ci_app_prefix=${ci_app_prefix}` +
        ` --build-arg ci_app_port=${ci_app_port}` +
        ` -t ${ci_image_name} -f ${ci_dockerfile} .`,
    cmd_image_push: `docker push ${ci_image_name}`
}
printLog(JSON.stringify(env, null, 2))
if (env3) {
    exec("compiler & build image from Dockerfile (golang->/app/launch)", env,
        `docker exec -i -w $work_dir ${ci_container_git} bash -c "$cmd_image_build"`,
        `docker exec -i ${ci_container_git} bash -c "$cmd_image_push"`)
}

// 📌 deploy service to swarm & running
env = {
    DOCKER_CONTEXT: ci_docker_context_deploy,
    commandCreate: cmdCreateService(ci_app_name, ci_image_name, ci_app_port,
        ci_app_entry, ci_app_prefix, ci_app_cpus, ci_app_memory, ci_app_replicas, ci_app_network),
    commandUpdate: cmdUpdateService(ci_app_name, ci_image_name, ci_app_port,
        ci_app_entry, ci_app_prefix, ci_app_cpus, ci_app_memory, ci_app_replicas)
}
printLog(JSON.stringify(env, null, 2))
if (env3) {
    let service_id = getServiceId(ci_docker_context_deploy, ci_app_name)
    if (service_id === false) {
        exec('📌 deploy service to swarm --Create', env, '$commandCreate')
    } else {
        exec('📌 deploy service to swarm --Update', env, '$commandUpdate')
    }
}