FROM docker.io/library/golang:1.17-alpine as build
WORKDIR /app
ADD . .

#RUN go mod download
ENV GO111MODULE="on"
ENV GOPROXY="https://goproxy.cn,direct"
ENV GOPRIVATE="ci.sdinc.cn"
#RUN go env -w GO111MODULE=on && go env -w GOPROXY=https://goproxy.cn,direct
RUN go build -o /app/launch

#https://hub.docker.com/_/scratch
#FROM docker.io/library/scratch
#FROM docker.io/library/busybox
FROM docker.io/library/alpine
ENV TZ "Asia/Shanghai"
# config
ARG ci_env
ARG ci_app_port
ARG ci_app_prefix
ENV app_env=${ci_env:-"dev"}
ENV app_prefix=${ci_app_prefix:-"/api-debug"}
ENV app_port=${ci_app_port:-"80"}

WORKDIR /app
COPY --from=build /app/launch /app/launch

#HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=300s CMD wget -cSq --spider 127.0.0.1${app_path}/healthcheck || exit 1
CMD [ "/app/launch" ]
