FROM node:9.3.0

# Update system & install ssh
RUN apt-get update
RUN apt-get install -y git openssh-server
RUN apt-get -y autoclean

# Set environment variables
ENV USER ubuntu
ENV NOTVISIBLE "in users profile"
ENV CONFIG_PATH "./config.json"
ENV NODE_NAME "tool"

# Config ssh
RUN mkdir /var/run/sshd
RUN echo 'root:root' | chpasswd
RUN sed -i 's/PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config
RUN sed -i 's/PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config
RUN sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config

# SSH login fix. Otherwise user is kicked off after login
RUN sed 's@session\s*required\s*pam_loginuid.so@session optional pam_loginuid.so@g' -i /etc/pam.d/sshd

# Set Environment varialables throughout the container
RUN echo "export VISIBLE=now" >> /etc/profile
RUN echo "export CONFIG_PATH=${CONFIG_PATH}" >> /etc/profile
RUN echo "export NODE_NAME=${NODE_NAME}" >> /etc/profile

# CMD ["/usr/sbin/sshd", "-p", "5001", "-D"]

# Install the project
COPY dist dist
WORKDIR dist
COPY package.json .
COPY translation.json .
COPY configs/config.json config.json
RUN npm i --production
RUN ls