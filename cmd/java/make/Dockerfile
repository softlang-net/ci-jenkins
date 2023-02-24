FROM maven:3-openjdk-8-slim

# run as dev (uid=1000)
RUN useradd -m -d /home/dev -s /bin/bash -u 1000 dev

COPY <<EOF /home/dev/m2_settings.xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <mirrors>
        <mirror>
            <id>mirror</id>
            <mirrorOf>*</mirrorOf>
            <name>mirror</name>
            <url>http://192.12.0.1:9083</url>
        </mirror>
    </mirrors>
</settings>
EOF

# CMD [ "nc", "-l", "-p", "80" ]
# CMD [ "ping", "-i", "3600", "127.0.0.1"]
