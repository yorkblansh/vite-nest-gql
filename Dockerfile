FROM node:16

WORKDIR /app

# COPY package*.json ./
# COPY tsconfig.build.json ./
# COPY tsconfig.json ./

COPY . .

RUN yarn set version stable 
RUN yarn install

CMD [ "yarn","run", "start:prod" ]
