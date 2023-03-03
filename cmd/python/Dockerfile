FROM python:3.10-slim
#-- define this to get args from docker build-arg
ARG ci_env
ARG ci_app_port
ARG ci_app_path
#-----
ENV app_env=${ci_env:-"dev"}
ENV app_path=${ci_app_path:-"/api-python-123"}
ENV app_port=${ci_app_port:-"80"}

WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
COPY . .

#ENV healthy="wget -T 3 -qS --spider 127.0.0.1:${app_port}${app_path}/healthcheck"
#HEALTHCHECK --interval=30s --timeout=5s --retries=3 --start-period=120s CMD $healthy || exit 1

CMD [ "python3", "index.py"]
