FROM docker.io/library/golang:1.17-alpine as build

# config
ARG ci_env_profile
ARG ci_router_prefix
ENV app_env=${ci_env_profile:-"dev"}
ENV app_path=${ci_router_prefix:-"/ui-debug"}

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

WORKDIR /app
COPY --from=build /app/launch /app/launch

CMD [ "/app/launch" ]
