#!/bin/bash
set -e

cat <<EOF > ./.test.log
hello chatGPT
1. design
2. category the content
done
EOF

cat <<EOF
the log line1
the log line2
the log line3
EOF
echo "finish"
image_bash_c="docker build --force-rm --compress
    --build-arg ci_env_profile=${TZ}
    --build-arg ci_router_prefix=ssss
    -t 'afsdfadsf' -f 1234 ."

echo $image_bash_c
