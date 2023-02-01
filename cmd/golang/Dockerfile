#https://hub.docker.com/_/scratch
#FROM docker.io/library/scratch
#FROM docker.io/library/busybox
FROM docker.io/library/alpine
ENV TZ "Asia/Shanghai"

WORKDIR /app
COPY --from=build /docker-gs-ping ./
EXPOSE 8080

CMD [ "/app/docker-gs-ping" ]
