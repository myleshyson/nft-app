FROM node:16-buster-slim

RUN apt-get update \
&& apt-get install -y autoconf build-essential git tini \
&& apt-get clean

WORKDIR /var/www/html

COPY ./pages pages
COPY ./public public
COPY ./styles styles
COPY ./next.config.js next.config.js
COPY ./package-lock.json package-lock.json
COPY ./package.json package.json

RUN npm i
EXPOSE 3000

ENTRYPOINT ["tini", "--", "npm", "run", "dev"]