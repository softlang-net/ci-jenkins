FROM docker.io/library/golang:1.17-alpine as build

WORKDIR /app
ADD . .

#RUN go mod download
RUN go env -w GO111MODULE=on \
    && go env -w GOPROXY=https://goproxy.cn,direct \
    && go build -o /docker-gs-ping

#https://hub.docker.com/_/scratch
#FROM docker.io/library/scratch
#FROM docker.io/library/busybox
FROM docker.io/library/alpine

WORKDIR /app

COPY --from=build /docker-gs-ping ./

EXPOSE 8080

CMD [ "/app/docker-gs-ping" ]
