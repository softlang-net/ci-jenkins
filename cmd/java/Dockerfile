FROM softlang/openjdk8-alpine:Fontconfig

#--- args to receipt from docker build-arg
ARG ci_env
ARG ci_app_port
ARG ci_app_prefix
ENV app_env=${ci_env:-"dev"}
ENV app_prefix=${ci_app_prefix:-"/api-debug"}
ENV app_port=${ci_app_port:-"80"}
ENV JAVA_OPS=${ci_java_ops:-"-Xms128m -Xmx128m"}

WORKDIR /app
ADD target/app.jar /app

ENV checkhealth="wget -cSq --spider 127.0.0.1:${app_port}${app_path}/healthcheck"
HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=300s CMD $checkhealth || exit 1

ENV JAR_OPS="--spring.profiles.active=${app_env} --server.port=${app_port} --server.servlet.context-path=${app_prefix}"
CMD ["sh","-c","java ${JAVA_OPS} -jar app.jar ${JAR_OPS}"]
