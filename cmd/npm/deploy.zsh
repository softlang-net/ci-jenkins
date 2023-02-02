#!/bin/bash
#------deploy for h5 with NPM ------
TZ=UTC-8
set -e;
# 🔻🔻🔻🔻🔻🔻🔻🔻🔻
ci_env_profile=${ci_env_profile:-dev}
ci_env_image_tag=${BUILD_NUMBER:-latest}
ci_env_registry=${ci_env_registry:ci.devops.os:5000}

ci_docker_context_build=${ci_compose_cpus:-default}
ci_docker_context_deploy=${ci_compose_cpus:-default}

ci_compose_cpus=${ci_compose_cpus:-1}
ci_compose_memory=${ci_compose_memory:-512M}
ci_compose_replicas=${ci_compose_replicas:-1}
ci_compose_service_name=${ci_compose_service}
ci_compose_service_port=${ci_compose_service:-80}
ci_compose_network=${ci_compose_network}

ci_router_entry=${ci_router_entry:-traefik}
ci_router_prefix=${ci_router_prefix:-"/$ci_compose_service"}

ci_dockerfile=${ci_compose_dockerfile:-Dockerfile}
ci_git_project=${ci_git_project}
ci_git_src_dir=${ci_git_src_dir}
# ❓❓❓
ci_compose_image="${ci_env_registry}/${ci_env_profile}/${ci_compose_service_name}:${ci_env_image_tag}" #⛔镜像tag&仓库
ci_env_app_path=${ci_router_prefix} #⛔docker env app_path
# work_dir
ci_work_dir="/opt/deploy/uat/${JOB_NAME}" #⛔构建目录
ci_git_host="ssh://git@ci2.devops.dss:10022" #git clone
ci_git_devops=${ci_git_host}/zyb/devops.git
ci_git_env_config=env/Stars_UAT.conf #⛔env-config@git
# 🔺🔺🔺🔺🔺🔺🔺🔺🔺🔺

echo ">>📌 1. environments"
env

echo ">>📌 2. clone from git"
# 1. git clone && git archive --remote=ssh://git@xxx <branch | HEAD> <prefix_path/xxx/xx> 
rm ${ci_work_dir} -rf && mkdir -p ${ci_work_dir} && cd ${ci_work_dir}
git clone -b $ci_git_branch ${ci_git_host}/${ci_git_project} ${ci_work_dir}/src
cd $(realpath src/${ci_git_src_dir}) # change the real source-code work-dir

# 2. build
# 执行打包
echo ">>📌 3. npm install && build"
# ( docker rm -fv tmp-${ci_compose_service} && docker container inspect tmp-${ci_compose_service} ) || echo ">>😊no tmp-${ci_compose_service}"
#docker run -i --rm -u node -v $PWD:/app -w /app --network host --cpus 3 -m 2048M \
#    --name tmp-${ci_compose_service} node:16-alpine3.15 \
#    npm install --registry http://127.0.0.1:4873/ --force --quiet && npm run build --quiet && echo ">>✅packaged by docker🚢"
#docker exec -i -w $PWD cicd-node12.dev npm install --force --registry https://registry.npmmirror.com/ --quiet
#docker exec -i -w $PWD cicd-node12.dev npm run build --quiet
npm_bash_c="npm install --registry https://registry.npmmirror.com/ --quiet && npm run build --quiet"
#npm_bash_c="npm install --cache ./.npm_cache --registry http://127.0.0.1:4873/ --force --quiet && npm run build --quiet"
docker exec -i -w $PWD -u node cicd-node12.dev bash -c "${npm_bash_c}"

LAST_ERROR_CODE=$?
if [ ! "$LAST_ERROR_CODE" = "0" ]
then
  echo ">> npm install && build failed (@docker) : $LAST_ERROR_CODE"
  exit $LAST_ERROR_CODE
fi

# 3. docker build
# git download single file
# git archive --remote=git@github.com:foo/bar.git --prefix=path/to/ HEAD:path/to/ |  tar xvf -
echo ">>📌 4. build image && push to registry"
export DOCKER_CONTEXT=${CI_DOCKER_CONTEXT_BUILD}
docker image prune -f
docker build --network host --force-rm --compress \
    --build-arg profile=${ci_env_profile} \
    --build-arg app_path=${ci_env_app_path} \
    -t "${ci_compose_image}" \
    -f ${ci_dockerfile} \
    . # Dockerfile context path

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
