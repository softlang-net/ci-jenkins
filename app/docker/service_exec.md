#### docker exec -it for swarm_service

```shell
# find container by service label
docker ps -f "label=com.docker.swarm.service.name=gitlab_gitlab"
# only get id
docker ps -f "label=com.docker.swarm.service.name=gitlab_gitlab" --format "{{.ID}}"

# better format
my_containerid=`docker ps -f "label=com.docker.swarm.service.name=gitlab_gitlab" --format "{{.ID}}"`
docker exec -it $my_containerid bash

# You could use the following command to print the container id:
docker container ls  | grep 'container-name' | awk '{print $1}'

# As a bonus point, if you want to login to the container with a container name:
docker exec -it $(docker container ls  | grep 'container-name' | awk '{print $1}') /bin/bash
```