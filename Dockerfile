FROM node:16

WORKDIR /app

COPY . .

RUN yarn set version stable 
RUN yarn install
RUN yarn run build

CMD [ "yarn","run", "start:prod" ]
