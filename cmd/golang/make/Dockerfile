FROM golang:1.17-alpine

WORKDIR /app

RUN sed -i s+dl-cdn.alpinelinux.org+mirrors.aliyun.com+g /etc/apk/repositories \
    && apk update && apk add curl && rm -rf /var/cache/apk/*

#RUN go mod download
ENV GO111MODULE="on"
ENV GOPROXY="https://goproxy.cn,direct"
ENV GOPRIVATE="ci.sdinc.cn"

#CMD [ "nc", "-l", "-p", "80" ]