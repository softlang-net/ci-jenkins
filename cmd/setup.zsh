#!/bin/bash
set -e

cat <<EOF 
install devops list:
1. deploy-npm
2. deploy-golang
3. deploy-node
4. deploy-java
5. deploy-python
EOF

while read line; do
  echo "reading: ${line}" && break
done < /dev/stdin

echo "You chose is ${line}"

cat <<EOF
deploy the compilers
1. git-docker-cli
2. node-compiler
EOF
echo "finish"
