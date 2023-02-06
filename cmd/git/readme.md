#### how git & docker-cli work?

- git-compose contains both git and docker-cli tools
- both of them has the same workspace: /opt/make/workspace
- git: used to clone source code from the git-repository
- docker-cli used to connect to the docker host, build image & push to registry
- 🧭be attention: Change the user-group-id to the host's docker's groupId
