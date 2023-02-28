### build nginx1.20 image

```Dockerfile
# docker build --network host --force-rm -f ng.Dockerfile -t softlang/nginx:v1.20 .
FROM nginx:1.20-alpine
COPY nginx-1.20.conf /etc/nginx/nginx.conf
COPY default-1.20.conf /etc/nginx/conf.d/default.conf
```

```conf
# /etc/nginx/conf.d/default.conf
# https://www.debuggex.com/cheatsheet/regex/pcre
# https://www.regular-expressions.info/reference.html
server {
	listen 10081;
	root /var/www/html;
    default_type text/html;
	server_name _;

	location ~ "^/[\d]{5}" {
		return 200 'test111\n';
        # ...
	}

    # my_api max is 66 characters
	location ~ "^/api/(?<my_api>([^/]{1,10}))" {
		return 200 'api is $my_api, url=$request_uri\n';
	}

	location ~ ^/app/(?<my_app>([^/]+)) {
		return 200 'app is $my_app, url=$request_uri\n';
	}

	location ~ ^/ui-(?<my_ui>([^/]+)) {
		return 200 'ui to ui-$my_ui, url=$request_uri\n';
	}

	location ~ ^/(?<my_ui>([^/]+)) {
		return 200 'proxy to $my_ui, url=$request_uri\n';
	}

    location /debug {
        return 200 'debug >> $request_uri';
    }
}
```

```conf
# /etc/nginx/nginx.conf
# nginx:1.20-alpine
user  nginx;
worker_processes  auto;
worker_rlimit_nofile 65536;
error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;
stream {
    server {
      listen 10080;
      proxy_pass 127.0.0.1:80;
    }
}
events {
    worker_connections 8192;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';
    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;
    include /etc/nginx/conf.d/*.conf;
}
```