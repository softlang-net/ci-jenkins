#### deploy repository for maven

```yaml
# docker-compose -p host-mvn -f compose.yaml up -d
# docker-compose -p host-mvn down
version: "3.8"
services:
  maven-reposilite:
    image: softlang/maven:reposilite-2.9.26
    hostname: maven-reposilite.dev
    container_name: maven-reposilite.dev
    environment:
      - TZ=Asia/Shanghai
      - JAVA_OPTS=-Xmx128M -Dreposilite.port=9083
      #- REPOSILITE_OPTS=${REPOSILITE_COMPOSE_OPTS}
    healthcheck:
      test: ["CMD", "wget", "--spider", "127.0.0.1:9083/health"]
      interval: 15s
      retries: 3
    network_mode: host
    volumes:
      - ./data:/app/data
    network_mode: host
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 256M

#PORT=8080
#MEMORY=128M
#JAVA_COMPOSE_OPTS=
#REPOSILITE_COMPOSE_OPTS=
```

- reposilite cli for config

> https://reposilite.com/
> https://reposilite.com/guide/manual
> https://v2.reposilite.com/docs/authorization

```shell
# https://v2.reposilite.com/docs/authorization
# see the parameters
java -jar reposilite.jar --help

# use the not userd port=8089 
java -Xmx32M -Dreposilite.port=8089 -jar reposilite.jar --working-directory=/app/data
# workdir=/app, use -wd=data
java -Xmx32M -Dreposilite.port=8089 -jar reposilite.jar -wd=data

# cli in reposilite
help keygen # see the keygen parameters
keygen / root m # !!! please copy & save the token printed on the CLI
stop
```

```log
20:38:58.961 INFO | Stored tokens: 2
20:38:58.963 INFO | Generated new access token for admin (/) with 'w' permissions
20:38:58.964 INFO | 7KIuOni8J0YPlFBLb8bMvDR/SdO1hUe5zvMiFMgmz+CDEp8sDjiutjpnos1Hu/Yr
Reposilite 2.9.26 Commands:
11:00:30.135 INFO |   chalias <alias> <new alias> - Change token alias
11:00:30.136 INFO |   chmod <alias> <permissions> - Change token permissions
11:00:30.136 INFO |   failures  - Display all recorded exceptions
11:00:30.136 INFO |   help [<command>] - List of available commands
11:00:30.136 INFO |   keygen <path> <alias> [<permissions>] - Generate a new access token for the given path
11:00:30.136 INFO |   purge  - Clear cache
11:00:30.136 INFO |   revoke <alias> - Revoke token
11:00:30.136 INFO |   stats [<filter>] - Display collected metrics
11:00:30.137 INFO |   status  - Display summary status of app health
11:00:30.137 INFO |   stop  - Shutdown server
11:00:30.137 INFO |   tokens  - List all generated tokens
11:00:30.137 INFO |   version  - Display current version of Reposilite
```

#### test for maven

- ~/.m2/settings.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <mirrors>
        <mirror>
            <id>mirror</id>
            <mirrorOf>*</mirrorOf>
            <name>mirror</name>
            <url>http://192.12.0.1:9083</url>
        </mirror>
    </mirrors>
</settings>
```

- ~/shell

```shell
# https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html
mvn dependency:tree
```

- ~/demo/pom.xml (https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>myproject</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.6.7</version>
    </parent>

    <!-- Additional lines to be added here... -->

</project>
```