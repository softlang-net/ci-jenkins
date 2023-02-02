FROM node:12-alpine3.15

RUN sed -i s+dl-cdn.alpinelinux.org+mirrors.aliyun.com+g /etc/apk/repositories \
    && apk update && apk add --no-cache tzdata python2 &&  rm -rf /var/cache/apk/*

# ping 600s=10mins
# CMD [ "ping", "-i", "600", "127.0.0.1"]
CMD [ "nc", "-l", "-p", "80" ]