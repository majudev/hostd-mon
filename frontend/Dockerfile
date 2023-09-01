FROM node:20-alpine

WORKDIR /frontend

COPY . .

RUN npm install

RUN npm install -g serve

ENTRYPOINT ["/frontend/serve.sh"]
