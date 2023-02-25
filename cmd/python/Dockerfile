FROM python:3.10-slim
#-- define this to get args from docker build-arg
ARG ci_env
ARG ci_app_port
ARG ci_app_prefix
#-----
ENV app_env=${ci_env:-"dev"}
ENV app_prefix=${ci_app_prefix:-"/api-python-123"}
ENV app_port=${ci_app_port:-"80"}

WORKDIR /app
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/
COPY . .

CMD [ "python3", "index.py"]
