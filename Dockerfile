FROM node:9.3.0

RUN apt-get update
RUN apt-get install -y git
RUN apt-get -y autoclean

RUN mkdir reiso
WORKDIR reiso

RUN git clone https://github.com/makamekm/reiso.git .
RUN git pull
RUN npm i
