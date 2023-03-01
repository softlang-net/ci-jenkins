#### how to use?

- test.zsh, test for multiple lines strings

```shell
#!/bin/bash
set -e
cat <<EOF > ./.test.log
hello chatGPT
1. design
2. category the content
EOF

cat <<EOF
the log line1
the log line2
EOF
echo "finish"
image_bash_c="docker build --force-rm --compress
    --build-arg ci_env_profile=${TZ}
    --build-arg ci_router_prefix=ssss
    -t 'afsdfadsf' -f 1234 ."
echo $image_bash_c
```

- test shell function
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
