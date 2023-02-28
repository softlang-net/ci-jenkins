#### nginx config for vts module

- nginx config `/etc/nginx/conf.d/nginx_vts.conf`

```conf
# the nginx.conf `http { include /etc/nginx/conf.d/*.conf; }`
# so  `/etc/nginx/conf.d/nginx_vts.conf` can be load success
vhost_traffic_status_zone;
# vts -- stats
server {
    listen 8039;
    server_name _;
    location / {
        vhost_traffic_status_display;
        vhost_traffic_status_display_format html;
    }
}
```

- the nginx vts docker i`mage

```md
> vts docker image `docker.io/softlang/nginx:vts-v1.18 `
> vts docker image `docker pull softlang/nginx:v1.20-vts`
> https://hub.docker.com/r/softlang/nginx/tags
```

- install on linux

```shell
# https://nginx.org/packages/rhel/8/x86_64/RPMS/
#---- fedora 35+ -----
dnf search nginx |grep mod-vts
dnf info nginx-mod-vts
dnf install nginx-mod-vts
```