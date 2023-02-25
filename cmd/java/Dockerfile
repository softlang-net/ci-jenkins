FROM softlang/openjdk8-alpine:Fontconfig

WORKDIR /app

ENV profile=dev
ENV JAVA_OPS="-Xms256m -Xmx256m"
ADD target/app.jar /app

HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=300s CMD wget -cSq --spider 127.0.0.1${app_path}/healthcheck || exit 1

CMD ["sh","-c","java ${JAVA_OPS} -jar app.jar --spring.profiles.active=${profile} --server.port=80 --server.servlet.context-path=${app_path}"]
