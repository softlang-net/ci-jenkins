# sdinc-vue/react-image-Dockerfile
FROM nginx:1.14-alpine
ENV TZ "Asia/Shanghai"
WORKDIR /web
#ENV BUILD_PATH='./dist', default: vue=dist, react=build (config by ENV.BUILD_PATH)
COPY ./dist   /web
#-- define this to get args from docker build-arg
ARG ci_env
ARG ci_app_port
ARG ci_app_path
#-----
ENV app_env=${ci_env:-"dev"}
ENV app_path=${ci_app_path:-"/ui-debug"}
ENV app_port=${ci_app_port:-"80"}

#RUN ln -s /web /usr/share/nginx/html/${app_path}
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen ${app_port};
    server_name _;
    root /usr/share/nginx/html;
    location ${app_path} {
        alias /web/;
        expires \$expires;
    }
    location = / {return 200 "ok"; }
}
EOF

# for options
COPY <<EOF /etc/nginx/conf.d/_http.conf
map \$sent_http_content_type \$expires {
    default off;
    text/html epoch;
    #application/pdf 42d;
}
EOF

#HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=60s CMD wget -T 3 -qS --spider 127.0.0.1:${app_port}/ || exit 1
ENV checkhealth="wget -T 3 -qS --spider 127.0.0.1:${app_port}/"
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=60s CMD $checkhealth || exit 1

CMD ["nginx", "-g", "daemon off;"]
