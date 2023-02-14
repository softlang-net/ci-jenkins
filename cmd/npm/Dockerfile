# sdinc-vue/react-image-Dockerfile
FROM nginx:1.14-alpine
ENV TZ "Asia/Shanghai"
WORKDIR /web
#ENV BUILD_PATH='./dist', default: vue=dist, react=build (config by ENV.BUILD_PATH)
COPY ./dist   /web
ARG app_path=${ci_router_prefix:-"/ui-debug"}
#RUN ln -s /web /usr/share/nginx/html/${app_path}
RUN echo "server { listen 80; server_name _; root /usr/share/nginx/html; \
    location ${app_path} { alias /web/; }}" > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
