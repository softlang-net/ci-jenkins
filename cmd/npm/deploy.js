#!/bin/node
const {exec, getEnv} = require('./deploy.js.js');

/** --------- start business coding -------- */
//exec("text01", 'default', ['service', 'ls'])
exec("text01", 'default', 'pwd', 'ls -l')
exec("text02", 'default', 'pwd2', 'ls -l')

console.log(`aaa=${getEnv('aaa', 4565)}`)
console.log(`bbb=${getEnv('bbb', 'go234')}`)

let docker_context = getEnv('ci_docker_context_build', 'default')
let command = `rm -rf ${getEnv('ci_work_dir')} && mkdir -p ${getEnv('ci_work_dir')} && git clone -b ${getEnv('ci_git_branch')} ${getEnv('ci_git_project')} ${getEnv('ci_work_dir')}/src`;
console.log(command)
