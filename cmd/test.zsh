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
