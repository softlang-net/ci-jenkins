#!/bin/node
const { exec, getEnv, printLog } = require('./deploy.jsp.js');

const
    ci_env_profile = getEnv('ci_env_profile', 'dev'),
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
//exec("text01", 'default', ['service', 'ls'])
exec("📌 1. print environments", 'default', 'pwd', 'env')
let env = {
    DOCKER_CONTEXT: context,
    cmd1: `rm -rf ${ci_work_dir} && mkdir -p ${ci_work_dir}`,
    cmd2: `git clone -b ${ci_git_branch} ${ci_git_project} ${ci_work_dir}/src`
}
printLog(env)
// 1. workspace
exec("📌 2. workspace prepare", env, 'env',
    `docker exec -i ${ci_container_git} bash -c "$cmd1"`,
    `docker exec -i ${ci_container_git} bash -c "$cmd2"`)

//docker exec - i - u git $ci_container_git bash - c "${git_bash_c1}"
//${ ci_docker_context_build }
printLog(ci_env_profile)

let docker_context = getEnv('ci_docker_context_build', 'default')
let command = `rm -rf ${getEnv('ci_work_dir')} && mkdir -p ${getEnv('ci_work_dir')} && git clone -b ${getEnv('ci_git_branch')} ${getEnv('ci_git_project')} ${getEnv('ci_work_dir')}/src`;
console.log(command)
