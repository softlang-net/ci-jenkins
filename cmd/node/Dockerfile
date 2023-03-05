FROM node:16.13-stretch-slim
ENV NODE_ENV=production
#-- define this to get args from docker build-arg
ARG ci_env
ARG ci_app_port
ARG ci_app_path
#-----
ENV app_env=${ci_env:-"dev"}
ENV app_path=${ci_app_path:-"/api-debug-node"}
ENV app_port=${ci_app_port:-"80"}

WORKDIR /app
COPY . .

RUN npm install --production
RUN npm cache clean --force

#ENV healthy="wget -T 3 -qS --spider 127.0.0.1:${app_port}${app_path}/healthy"
#HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=120s CMD $healthy || exit 1

CMD [ "node", "server.js" ]