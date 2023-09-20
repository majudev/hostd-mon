FROM node:20-alpine

WORKDIR /frontend

COPY . .

RUN npm install && npm run build

RUN npm install -g serve

ENTRYPOINT ["/frontend/serve.sh"]
