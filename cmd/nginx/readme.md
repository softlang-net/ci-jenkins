#### nginx as ingress for docker-swarm

> https://hub.docker.com/r/softlang/nginx

## nginx as ingress senses.
> We proposal softlang/nginx:v1.20, softlang/nginx:v1.22-vts

- nginx as ingress for docker swarm

```shell
# base on nginx:1.20-alpine, support ingress route by Header / subdomain / uri-prefix, support stream
docker run -itd --rm --name nginx -m=64M softlang/nginx:v1.20
```

- nginx with vts module

```shell
# base on alpine
docker run -itd --rm --name ngvts -m=64M -p 8080:80 softlang/nginx:vts-v1.18

# base on fedora:33, support ingress route by Header / subdomain / uri-prefix
docker run -itd --rm --name ngvts -m=64M softlang/nginx:v1.20-vts

# base on fedora:35, support ingress route by Header / subdomain / uri-prefix
docker run -itd --rm --name ngvts -m=64M softlang/nginx:v1.22-vts
```

- How to check the vts data?
> http://xxx-your-host-xx:8080/status/format/html
> http://xxx-your-host-xx:8080/status/format/json

- nginx njs
```shell
# base on nginx:1.22 (debian), support njs modules.
docker pull softlang/nginx:1.22-njs
docker run -itd --rm --name nginx -m=64M softlang/nginx:1.22-njs
```