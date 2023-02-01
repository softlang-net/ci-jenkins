FROM nginx:1.14-alpine
ENV TZ "Asia/Shanghai"
WORKDIR /web
ARG app_path=ui-app1
COPY ./build   /web
RUN ln -s /web /usr/share/nginx/html/${app_path}
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
