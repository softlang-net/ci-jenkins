#!/bin/bash
set -e

cat <<EOF > ./.test.log
hello chatGPT
1. design
2. category the content
done
EOF

ls -l
cat test.log
