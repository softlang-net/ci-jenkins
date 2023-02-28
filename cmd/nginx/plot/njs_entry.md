## nginx as a service discovery in docker-swarm

- compose.yaml

```yaml
# docker stack deploy -c compose.yaml ingress
version: '3.7'
networks:
  default:
    external: true
    name: netdev
      
services:
  ngx-entry:
    image: nginx:1.22
    ports:
      - mode: host
        target: 80
        published: 8000
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./conf.d:/etc/nginx/conf.d
    deploy:
      mode: global
      placement:
        constraints:
          - node.role == manager
      update_config:
        parallelism: 1
        delay: 15s
      resources:
        limits:
          cpus: '1'
          memory: 256M
```

- /etc/nginx/conf.d/http.js 代码
```js
// 获取目标服务名称(/uri_first_as_sevice)
function get_proxy_pass(r) {
    var pass = r.uri;
    var pp = "";
    if (pass.length > 1 && pass.charAt(0) == '/') {
        pp = pass.split("/", 2)[1].split("?", 1);
    }
    return pp;
}

// 快速打印版本号(增加subrequest,只支持当前nginx下的 location /地址)
function version(r) {
    // r.return(200, njs.version);
    r.subrequest('/ss-debug/stats', { method: 'GET' }, function (res) {
        if (res.status != 200) {
            r.return(res.status, "version=" + njs.version);
        }
        else {
            var ss = res.responseBody;
            r.return(200, "njs-version: " + njs.version + ", stats: " + ss);
        }
    });
}

// 打印debug信息
function req_debug(r) {
    r.status = 200;
    r.headersOut.foo = "nginx-njs-ingress";
    r.headersOut['Content-Type'] = "text/html; charset=utf-8";
    //r.headersOut['Content-Length'] = 15; // 设置返回的内容长度
    r.sendHeader();
    var njsVer = njs.version;
    var pp = get_proxy_pass(r);
    r.send("<h2>proxy_pass = " + pp + "</h2>");
    r.send("<p>njs_version = " + njsVer + "</p>");
    r.send("<p>uri = " + r.uri + "</p>");
    r.send("<p>method = " + r.method + "</p>");
    r.send("<p>remoteAddress = " + r.remoteAddress + "</p>");
    
    r.send("<h3>variables</h3>");
    for (var a in r.variables) {
        r.send("<p>variables." + a + " = " + r.variables[a] + "</p>");
    }

    r.send("<h3>args</h3>");
    for (var a in r.args) {
        r.send("<p>args." + a + " = " + r.args[a] + "</p>");
    }

    r.send("<h3>headersIn</h3>");
    for (var a in r.headersIn) {
        r.send("<p>headersIn." + a + " = " + r.headersIn[a] + "</p>");
    }

    r.send("<h3>headersOut</h3>");
    for (var a in r.headersOut) {
        r.send("<p>headersOut." + a + " = " + r.headersOut[a] + "</p>");
    }

    r.finish();
}

export default { version, req_debug, get_proxy_pass };
```

- nginx.conf 配置
```conf
user  nginx;
worker_processes 2; # ->auto
error_log  /var/log/nginx/error.log warn;
pid        /var/run/nginx.pid;
# load njs module
load_module modules/ngx_http_js_module.so;
events {
    worker_connections  2048;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;
    keepalive_timeout 65;
    #gzip  on;

    resolver 127.0.0.11 valid=5s; #docker swarm dns
    resolver_timeout 1s;
    # load http.js
    js_import      http.js;
    # get proxy pass by njs
    js_set $njs_proxy_pass http.get_proxy_pass;

    include /etc/nginx/conf.d/*.conf;
}
```

- conf.d/default.conf 配置内容

```conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;
    default_type text/html;
    client_max_body_size 64M;
    
    #charset koi8-r;
    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        set $target $njs_proxy_pass;
        proxy_pass http://$target$request_uri;
        # proxy_pass http://$target:81$request_uri; # with port 81
        proxy_read_timeout 3600s; # default=60 seconds

        proxy_redirect off;# proxy_redirect http:// https://; # off
        proxy_http_version 1.1;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host:$server_port;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Real-Port $remote_port;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header HTTP_X_FORWARDED_FOR $remote_addr;
    }

    # print req_debug
    location /ss-debug/req {
        js_content http.req_debug;
    }

    location = /ss-debug/version {
        js_content http.version;
    }
    
    location /ss-debug/stats {
        stub_status on;
        access_log off;
    }

    location /ss-debug/root/ {
        alias   /usr/share/nginx/html/;
        index  index.html index.htm;
    }
    
    # server ip
    location  /ss-debug/ip {
        return 200 $server_addr;
        #return 200 $request_uri;
    }

    # server uri
    location  /ss-debug/uri {
        return 200 $request_uri;
    }

    #error_page  404              /404.html;
    # redirect server error pages to the static page /50x.html
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }
    
    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```