#### nginx proxy config for docker.socket

- docker context usage
> https://docs.docker.com/engine/context/working-with-contexts/

- docker context

```shell
usermod -a -G docker dev
docker context create --docker host=ssh://dev@pod11.uat.demo --description="docker@uat.demo" uat-demo
docker context create --docker host=ssh://dev@pod61.prd.demo --description="docker@uat.demo" prd-demo

docker context use uat-demo
docker info
docker context use default

export DOCKER_HOST=ssh://docker-user@host1.example.com
export DOCKER_CONTEXT=uat-demo   # by current env
docker info
```

- nginx proxy shell
```shell
usermod -a -G docker dev # local dev.user can run docker-cli
usermod -a -G docker www-data # nginx can proxy docker.sock
gpasswd -d www-data docker  # remove user groups
```

```conf
# nginx conf
# docker.socket
upstream docker {
    server unix:/var/run/docker.sock; # fail_timeout=0
}

server {
    listen 2375;
    server_name _;
    client_max_body_size 200m;

    allow 127.0.0.1;
    deny all;

    location / {
        proxy_pass http://docker;
    }

    proxy_connect_timeout 90;
    proxy_send_timeout 120;
    proxy_read_timeout 120;
}
```