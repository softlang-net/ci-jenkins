## nginx issue list (in production)

- the expires about nginx proxy for VUE | React ETC..
> expires可解决：浏览器缓存html，导致前端发版时不能及时刷新问题

```conf
# >>>> /etc/nginx/conf.d/_http.conf
map $sent_http_content_type $expires {
    default         off;
    text/html       epoch;
    #application/pdf 42d;
}
# >>>> /etc/nginx/conf.d/my-site.conf
server {
    listen 80;
    server_name _;

    location ~ ^/(.*)favicon.ico$ {
        alias html/favicon.ico;
        log_not_found off;
        access_log off;
    }
    location / {
        proxy_set_header X-Forwarded-Proto $scheme; # required for Docker client
        proxy_set_header Host $http_host;
        proxy_pass http://dev-pods/;
        expires $expires;
    }
```

- `proxy_read_timeout 3600s;` # default=60 seconds, for client wait

```conf
server {
    listen  80;
    server_name _;
    proxy_set_header Host $http_host;
    location /whoami/{
        proxy_read_timeout 3600s; # default=60 seconds
        proxy_pass http://127.0.0.1:8080/whoami;
    }
}
```

- how to support websocket

```conf
# http://nginx.org/en/docs/http/websocket.html
http {
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }
    server {
        proxy_set_header Host $http_host;
        location /chat/ {
            proxy_pass http://mqtt_ws_server/mqtt;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
        }
    }
    upstream mqtt_ws_server {
        server 127.0.0.1:8083; #可以配置多个，作为高可用
        keepalive 8192; 指定最大保持的长连接数为8192
    }
}
```

- nginx解决open too files 错误，增加 worker_rlimit_nofile

```conf
# /etc/ngxin/nginx.conf
user nginx;
worker_processes auto; # <= cpus * 2
worker_rlimit_nofile 40000; # >= worker_connections * cpus
events {
    worker_connections 10000;
}
```

- 跨域支持 cross domain, 配置需要匹配的域名
> CORS protocol and HTTP caches `https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Vary`

```conf
# -------- /etc/nginx/conf.d/my-site.conf --------
server {
    listen 80;
    server_name _;
    proxy_set_header Host $http_host;
    
    location /whoami/{
        include ./conf.d/_cors_header.cfg;
        proxy_pass http://zyb-dev-pods97/whoami/;
    }

    location /oss/{
        include ./conf.d/_cors_header.cfg;
        proxy_pass http://my.oss.com/oss/;
        error_page 401 http://my.app/ui-account/?return=https://$host:$server_port$request_uri;
    }
}

# -------- /etc/nginx/nginx.conf --------
http {
    map $http_origin $cors_header {
        default "";
        "~^https?://softlang\.net(:[0-9]+)?$" "$http_origin";
        "~^https?://[^/]+\.softlang\.net(:[0-9]+)?$" "$http_origin";
        "~^http?://localhost(:[0-9]+)?$" "$http_origin";
        # https? 包含 https 与 http, # localhost 用于 本地开发代理
    }
}

# -------- /etc/nginx/conf.d/_cors_header.cfg --------
add_header Vary Origin;
#proxy_hide_header Access-Control-Allow-Origin;
add_header Access-Control-Allow-Origin $cors_header;
#add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods '*';
#add_header Access-Control-Allow-Headers '*';
add_header Access-Control-Allow-Credentials 'true';
```

- nginx proxy for UDP_DNS

```conf /etc/nginx/conf.d/vhost.conf
# systemctl status systemd-resolved.service, systemctl status coredns
server{
    listen 53; # tcp
    listen 53 udp;
    proxy_pass 127.0.0.53:53; 
    allow 127.0.0.0/8;
    deny all;
}
```