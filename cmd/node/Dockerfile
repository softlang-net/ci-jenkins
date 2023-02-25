FROM node:16.13-stretch-slim
ENV NODE_ENV=production
#-- define this to get args from docker build-arg
ARG ci_env
ARG ci_app_port
ARG ci_app_prefix
#-----
ENV app_env=${ci_env:-"dev"}
ENV app_prefix=${ci_app_prefix:-"/api-debug-node"}
ENV app_port=${ci_app_port:-"80"}

WORKDIR /app
COPY . .

RUN npm install --production
RUN npm cache clean --force

CMD [ "node", "server.js" ]