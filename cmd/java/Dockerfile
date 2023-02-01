FROM softlang/openjdk8-alpine:Fontconfig

# ARG only avaiable and docker build, 
# env will be save to image & avaiable at runtime container
ARG profile=dev
ARG app_path=api-vip-sdm

#ARG app_jar="demo-0.0.1-SNAPSHOT.jar"

# confirm & create folder
WORKDIR /app
RUN cd /app

# add files
ADD target/api-vip-sdm-1.0.jar /app

# ADD target/jar2.jar /app
# ADD target/jar3.jar /app

ENV PORT 81
EXPOSE $PORT

HEALTHCHECK --interval=15s --timeout=5s --retries=3 --start-period=60s CMD wget -cSq --spider localhost:81/api-vip-sdm/healthcheck || exit 1

CMD ["java", "-jar","api-vip-sdm-1.0.jar", "--spring.profiles.active=${profile}","--server.port=81", "--server.servlet.context-path=/api-vip-sdm"]
