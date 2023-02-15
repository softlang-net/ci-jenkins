#!/bin/bash
#------deploy for h5 with NPM ------
TZ=UTC-8
set -e;
if [ ! "$1" = "" ]
then
    . $1
fi
# 🔻🔻🔻🔻🔻🔻🔻🔻🔻
ci_env_profile=${ci_env_profile:-dev}
ci_env_image_tag=${ci_env_image_tag:-${BUILD_NUMBER:-latest}}
ci_env_registry=${ci_env_registry:-"image.ci:5000"}

ci_docker_context_deploy=${ci_docker_context_deploy:-default}
ci_docker_context_build=${ci_docker_context_build:-default}
ci_container_git=${ci_container_git:-"git-docker-cli"}
ci_container_compiler=${ci_container_compiler:-"node-complier"}

# runtime resource config
ci_compose_cpus=${ci_compose_cpus:-1}
ci_compose_memory=${ci_compose_memory:-512M}
ci_compose_replicas=${ci_compose_replicas:-1}
ci_compose_service_name=${ci_compose_service_name:-$JOB_BASE_NAME}
ci_compose_service_port=${ci_compose_service_port:-80}
ci_compose_network=${ci_compose_network}

ci_router_entry=${ci_router_entry:-traefik}
ci_router_prefix=${ci_router_prefix:-"/$ci_compose_service"}

# compiler config
ci_dockerfile=${ci_dockerfile:-"/opt/make/compilers/npm/Dockerfile"}
ci_git_project=${ci_git_project}
ci_git_branch=${ci_git_branch:-$ci_env_profile}
ci_git_src_dir=${ci_git_src_dir:-""}
ci_workspace=${ci_workspace:-"/opt/make/workspace"}

# env_profile
ci_compose_image="${ci_env_registry}/${ci_env_profile}/${ci_compose_service_name}:${ci_env_image_tag}" #⛔镜像tag&仓库
# work_dir for source code & compiler
ci_work_dir="$ci_workspace/$ci_env_profile/${JOB_NAME:-$ci_compose_service_name}" #⛔构建目录
# 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺

# ----- for detect errors -----
LAST_ERROR_CODE=0
function check_docker_return() {
    if [ ! "$LAST_ERROR_CODE" = "0" ]
    then
        echo "❌>> $1, ERROR_CODE=$LAST_ERROR_CODE"
        exit $LAST_ERROR_CODE
    fi
}
# ----- for detect errors -----

echo ">>📌 1. environments=ci_env_profile"
#env # print env variables

# switch to the build docker_context
export DOCKER_CONTEXT=${ci_docker_context_build}

echo ">>📌 2. clone from git"
git_bash_c1="rm -rf ${ci_work_dir} && mkdir -p ${ci_work_dir}"
git_bash_c2="git clone -b $ci_git_branch $ci_git_project ${ci_work_dir}/src"

docker exec -i -u git $ci_container_git bash -c "${git_bash_c1}"
LAST_ERROR_CODE=$?
check_docker_return "Prepare work_dir failed"

docker exec -i -u git $ci_container_git bash -c "${git_bash_c2}"
LAST_ERROR_CODE=$?
check_docker_return "Git clone branch failed"

# 2. build
export DOCKER_CONTEXT=${ci_docker_context_build}
# 执行打包
echo ">>📌 3. npm install && build"
#docker exec -i -w $PWD cicd-node12.dev npm install --force --registry https://registry.npmmirror.com/ --quiet
#docker exec -i -w $PWD cicd-node12.dev npm run build --quiet
npm_bash_c="npm install --registry https://registry.npmmirror.com/ --quiet && npm run build --quiet"
#npm_bash_c="npm install --cache ./.npm_cache --registry http://127.0.0.1:4873/ --force --quiet && npm run build --quiet"
docker exec -i -w $ci_work_dir/src/$ci_git_src_dir -u node $ci_container_compiler bash -c "${npm_bash_c}"
LAST_ERROR_CODE=$?
check_docker_return "npm install && build failed"

# 3. docker build
# git download single file
# git archive --remote=git@github.com:foo/bar.git --prefix=path/to/ HEAD:path/to/ |  tar xvf -
echo ">>📌 4. build image && push to registry"
#docker image prune -f
image_bash_c=$(cat <<EOF
docker build --force-rm --compress 
    --build-arg ci_env_profile=${ci_env_profile} 
    --build-arg ci_router_prefix=${ci_router_prefix}
    -t '${ci_compose_image}'
    -f ${ci_dockerfile} .
EOF
)

echo $image_bash_c
echo ">> finish early"
exit 0;

docker push ${ci_compose_image}
docker rmi ${ci_compose_image} || echo ">>❌❌ docker rmi faild: ${ci_compose_image}"

# deploy service
# --env-file .env \
echo ">>📌 6. deploy to farm"
# deploy to docker_context@remote
NEED_UPDATE_SERVICE=1
export DOCKER_CONTEXT=${CI_DOCKER_CONTEXT_DEPLOY}
#docker service inspect --pretty ${ci_compose_service} || NEED_UPDATE_SERVICE=0
docker service inspect --format service_id={{.ID}} ${ci_compose_service} || NEED_UPDATE_SERVICE=0

if [ "${NEED_UPDATE_SERVICE}" = "1" ] 
then
    echo ">>✅ Update service..."
    docker service update -d \
        --label-add "io.portainer.accesscontrol.public" \
        --label-add "cigo=zyb" \
        --label-add "traefik.http.routers.${ci_compose_service}.entrypoints=zyb" \
        --label-add "traefik.http.routers.${ci_compose_service}.service=${ci_compose_service}" \
        --label-add "traefik.http.routers.${ci_compose_service}.rule=PathPrefix(\`${ci_router_prefix}\`)" \
        --label-add "traefik.http.services.${ci_compose_service}.loadbalancer.server.port=${ci_service_port}" \
        --limit-cpu ${ci_compose_cpus} \
        --limit-memory ${ci_compose_memory} \
        --replicas ${ci_compose_replicas} \
        --image ${ci_compose_image} \
        ${ci_compose_service}
    echo ">>✅ Update service success."
else
    echo ">>🟢 Create service..."
    docker service create -d --mode replicated \
        --network ${CI_DOCKER_NETWORK} \
        --update-parallelism 1 \
        --update-delay 20s \
        --restart-delay 30s \
        --restart-window 0 \
        --restart-max-attempts 10 \
        --name ${ci_compose_service} \
        --limit-cpu ${ci_compose_cpus} \
        --limit-memory ${ci_compose_memory} \
        --replicas ${ci_compose_replicas} \
        --label "io.portainer.accesscontrol.public" \
        --label "cigo=zyb" \
        --label "traefik.enable=true" \
        --label "traefik.http.routers.${ci_compose_service}.entrypoints=zyb" \
        --label "traefik.http.routers.${ci_compose_service}.service=${ci_compose_service}" \
        --label "traefik.http.routers.${ci_compose_service}.rule=PathPrefix(\`${ci_router_prefix}\`)" \
        --label "traefik.http.services.${ci_compose_service}.loadbalancer.server.port=${ci_service_port}" \
        ${ci_compose_image} # create new service

    echo ">>🟢 Create service success"
fi

echo ">>📌 7. service inspect"
docker service inspect --pretty ${ci_compose_service}
