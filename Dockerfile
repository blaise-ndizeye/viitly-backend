FROM node:16-alpine

WORKDIR /app

RUN npm install --global nodemon

COPY package*.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "dev"]