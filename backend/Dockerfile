FROM node:20

WORKDIR /backend

COPY . .

RUN npm install && npm run build

CMD ["npm", "run", "start"]
