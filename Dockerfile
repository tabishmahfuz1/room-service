FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build
COPY keys /usr/src/app/dist/keys

# Bundle app source

ENV PORT 80
EXPOSE 80

CMD ["node", "dist/index.js"]

