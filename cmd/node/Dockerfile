FROM node:16.13-stretch-slim
ENV NODE_ENV=production

RUN echo '' > /etc/apt/sources.list
RUN echo "\
deb http://mirrors.aliyun.com/debian/ stretch main non-free contrib \n\
deb http://mirrors.aliyun.com/debian-security stretch/updates main \n\
deb http://mirrors.aliyun.com/debian/ stretch-updates main non-free contrib \n\
deb http://mirrors.aliyun.com/debian/ stretch-backports main non-free contrib \n\
" > /etc/apt/sources.list

# wget for healthcheck
# RUN apt-get update && apt-get install wget -y \
#    && rm -rf /var/lib/apt/lists/* && apt-get clean

WORKDIR /app
#RUN chown node:node /app -R
RUN npm config set registry=http://registry.npm.taobao.org
#RUN npm install express --no-save --registry=http://registry.npm.taobao.org
CMD [ "node" ]