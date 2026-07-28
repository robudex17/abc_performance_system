FROM node:22-alpine AS builder

WORKDIR /app

# Declare build args
ARG NUXT_PUBLIC_API_URL
ARG NUXT_PUBLIC_SOCKET_IO_URL
ARG NITRO_PORT

COPY package*.json ./
RUN npm ci

COPY . .

# Bake public env vars into the build
#RUN echo "NUXT_PUBLIC_API_URL=${NUXT_PUBLIC_API_URL}" > .env && \
#    echo "NUXT_PUBLIC_SOCKET_IO_URL=${NUXT_PUBLIC_SOCKET_IO_URL}" >> .env && \
#    echo "NITRO_PORT=${NITRO_PORT}" >> .env

RUN npm run build

# ---- Runner stage ----
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
