FROM node:22-alpine

WORKDIR /app

ARG NUXT_PUBLIC_API_URL

ARG NUXT_PUBLIC_SOCKET_IO_URL


COPY package*.json ./

RUN npm install

RUN npm install -g pm2

COPY . .

RUN touch .env

RUN echo "NUXT_PUBLIC_API_URL=${NUXT_PUBLIC_API_URL}" > .env

RUN echo "NUXT_PUBLIC_SOCKET_IO_URL=${NUXT_PUBLIC_SOCKET_IO_URL}" >> .env


RUN  npm run build

EXPOSE  3000


CMD ["pm2-runtime", "start", ".output/server/index.mjs", "--name", "frontend-leaderboard"]