FROM alpine:3.16

ARG APK_MIRROR='mirrors.cloud.tencent.com'

RUN sed -i -e "s/dl-cdn.alpinelinux.org/${APK_MIRROR}/g" /etc/apk/repositories

RUN apk update && apk add git tzdata docker-cli && rm -rf /var/cache/apk/*

RUN adduser -D -s /bin/ash git

CMD [ "nc", "-l", "-p", "8080" ]
