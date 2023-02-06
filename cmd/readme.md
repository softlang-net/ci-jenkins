#### how to use?

```conf
# the environment
deploy_cid_image_tag=dev/app:v1.0
deploy_cid_git=xxx
deploy_cid_src=src/the-path-of-src-folder

deploy_cid_dockerfile=src/Dockerfile.the-path
deploy_cid_env=dev/uat/prd/test
deploy_cid_network=saas_dev,saas_uat,saas_prd
```


- for a test
```shell
#!/bin/bash
set -e

$LAST_ERROR_CODE=0

function check_docker_return() {
    if [ ! "$LAST_ERROR_CODE" = "0" ]
    then
        echo $1
        exit $LAST_ERROR_CODE
    fi
}

check_docker_return ">> npm install && build failed (@docker) : $LAST_ERROR_CODE"

$LAST_ERROR_CODE=1
check_docker_return "return 1"

echo ">> failed if you see this."


```